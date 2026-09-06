"""Regression for duplicate -> factual rejection shown in the Colab screenshot."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import generate_dialog as dialog


def draft(label):
    return {'summary': label, 'segments': [
        {'speaker': ['petr','jarda','lubo'][i % 3],
         'text': f'{label} {i} ' + 'slovo ' * 48, 'evidence': ['E1']}
        for i in range(6)]}


def data():
    return {'topic':'Zpráva', 'sources':[{'key':'E1','id':'source','offset':0,'text':'Ověřený podklad.'}],
            'previousChapters':[], 'lastReplies':[]}


class RepairTests(unittest.TestCase):
    def test_duplicate_then_factual_rejection_are_repaired_with_drafts_and_precise_feedback(self):
        first, second, third = draft('první'), draft('druhý'), draft('opravený')
        generated = iter([first, second, third])
        audits = iter([{'approved':False,'issues':['Replika 2: tvrzení o skutečné osobě není doložené; odstraň je.']}, {'approved':True,'issues':[]}])
        calls = []
        def complete(key, model, instruction, payload, shape='chapter'):
            calls.append((shape, model, copy.deepcopy(payload)))
            return next(generated) if shape == 'chapter' else next(audits)
        with tempfile.TemporaryDirectory() as directory, patch.object(dialog,'complete',side_effect=complete), patch.object(dialog,'FREE_MODELS',['other:free']), patch('builtins.print'):
            segments, summary = dialog.generate_chapter('secret','first:free',data(),[first['segments'][0]],Path(directory),0)
            chapter_calls = [c for c in calls if c[0]=='chapter']
            self.assertEqual(len(chapter_calls),3)
            self.assertEqual(chapter_calls[1][2]['rejectedDraft'],first)
            self.assertIn('Duplicitní replika 1',chapter_calls[1][2]['correction'])
            self.assertNotIn('rejectedDraft',chapter_calls[2][2])
            self.assertIn('Začni nový návrh',chapter_calls[2][2]['correction'])
            self.assertNotIn('Replika 2',chapter_calls[2][2]['correction'])
            self.assertEqual(chapter_calls[2][2]['sources'],data()['sources'])
            audit_calls = [c for c in calls if c[0]=='audit']
            self.assertEqual(audit_calls[0][2]['dialog'][0]['evidence'],['E1'])
            self.assertEqual(chapter_calls[1][1],'other:free')
            self.assertEqual(summary,'opravený')
            self.assertEqual(len(segments),6)

    def test_exhaustion_is_bounded_and_next_run_resumes_the_repair_not_an_empty_prompt(self):
        value = draft('neověřený')
        def reject(key, model, instruction, payload, shape='chapter'):
            return value if shape=='chapter' else {'approved':False,'issues':['Replika 1: nepodložené tvrzení.']}
        with tempfile.TemporaryDirectory() as directory, patch.object(dialog,'FREE_MODELS',[]), patch('builtins.print'):
            path=Path(directory)
            with patch.object(dialog,'complete',side_effect=reject) as request:
                with self.assertRaisesRegex(RuntimeError,'čtyřmi pokusy'):
                    dialog.generate_chapter('secret','first:free',data(),[],path,0)
                self.assertEqual(request.call_count,8)
            saved=json.loads((path/'rejected-chapter.json').read_text())
            self.assertEqual(saved['attempt'],4)
            self.assertNotIn('secret',json.dumps(saved))
            def resume(key, model, instruction, payload, shape='chapter'):
                if shape=='chapter':
                    self.assertEqual(payload['rejectedDraft'],value)
                    self.assertIn('nepodložené',payload['correction'])
                    return draft('opravený')
                return {'approved':True,'issues':[]}
            with patch.object(dialog,'complete',side_effect=resume):
                self.assertEqual(dialog.generate_chapter('secret','first:free',data(),[],path,0)[1],'opravený')

    def test_contradictory_audit_is_never_accepted(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(dialog,'FREE_MODELS',[]), patch('builtins.print'):
            def contradictory(key, model, instruction, payload, shape='chapter'):
                return draft('vadný') if shape=='chapter' else {'approved':True,'issues':['Neověřené tvrzení.']}
            with patch.object(dialog,'complete',side_effect=contradictory):
                with self.assertRaises(RuntimeError): dialog.generate_chapter('secret','first:free',data(),[],Path(directory),0)

    def test_changed_context_does_not_reuse_an_unrelated_failed_draft(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(dialog,'FREE_MODELS',[]), patch('builtins.print'):
            path=Path(directory)
            dialog.atomic_json(path/'rejected-chapter.json',{'contextId':'other','candidate':draft('old'),'error':'old','attempt':100})
            def complete(key, model, instruction, payload, shape='chapter'):
                if shape=='chapter':
                    self.assertNotIn('rejectedDraft',payload)
                    return draft('nový')
                return {'approved':True,'issues':[]}
            with patch.object(dialog,'complete',side_effect=complete):
                dialog.generate_chapter('secret','first:free',data(),[],path,0)

    def test_api_failure_during_audit_preserves_draft_without_retrying_account_quota(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(dialog,'FREE_MODELS',[]), patch('builtins.print'):
            path=Path(directory)
            value=draft('čekající')
            def unavailable(key, model, instruction, payload, shape='chapter'):
                if shape=='chapter': return value
                raise RuntimeError('OpenRouter HTTP 429')
            with patch.object(dialog,'complete',side_effect=unavailable) as request:
                with self.assertRaisesRegex(RuntimeError,'429'):
                    dialog.generate_chapter('secret','first:free',data(),[],path,0)
                self.assertEqual(request.call_count,2)
            self.assertEqual(json.loads((path/'rejected-chapter.json').read_text())['candidate'],value)
