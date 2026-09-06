import io
import json
import unittest
from unittest.mock import patch
import generate_dialog as dialog


def response(body):
    stream = io.StringIO(json.dumps(body))
    stream.headers = {}
    return stream


class ApiErrorsTests(unittest.TestCase):
    def test_http_200_provider_error_retries_free_models(self):
        payload = {'models': ['first:free', 'second:free']}
        with patch.object(dialog.urllib.request, 'urlopen', side_effect=[
            response({'error': {'code': 502, 'message': 'Provider unavailable'}}),
            response({'choices': []})
        ]) as call, patch.object(dialog.time, 'sleep'), patch('builtins.print'):
            self.assertEqual(dialog.request_json('https://example.org', 'secret', payload), {'choices': []})
            sent = json.loads(call.call_args_list[1].args[0].data)
            self.assertEqual(sent['models'], ['second:free', 'first:free'])
            self.assertEqual(payload['models'], ['first:free', 'second:free'])

    def test_account_errors_do_not_retry_and_redact_key(self):
        for code in [401, 402, 403, 429]:
            with self.subTest(code=code), patch.object(dialog.urllib.request, 'urlopen', return_value=response(
                {'error': {'code': code, 'message': 'Failure secret sk-or-v1-hidden',
                           'metadata': {'raw': 'DO NOT PRINT'}}}
            )) as call:
                with self.assertRaises(RuntimeError) as error:
                    dialog.request_json('https://example.org', 'secret', {'models': ['first:free']})
                self.assertIn(str(code), str(error.exception))
                for sensitive in ['secret', 'sk-or-v1-hidden', 'DO NOT PRINT']:
                    self.assertNotIn(sensitive, str(error.exception))
                self.assertEqual(call.call_count, 1)

    def test_provider_retries_are_bounded(self):
        with patch.object(dialog.urllib.request, 'urlopen', side_effect=[
            response({'error': {'code': 503, 'message': 'Unavailable'}}) for _ in range(3)
        ]) as call, patch.object(dialog.time, 'sleep'), patch('builtins.print'):
            with self.assertRaisesRegex(RuntimeError, '503'):
                dialog.request_json('https://example.org', 'secret')
            self.assertEqual(call.call_count, 3)
