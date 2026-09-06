"""Self-contained Colab renderer, embedded verbatim in exported notebooks."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path


def validate_episode(episode):
    if not isinstance(episode, dict) or not isinstance(episode.get('segments'), list):
        raise ValueError('Chybí seznam replik.')
    segments = episode['segments']
    speakers = set()
    words = 0
    for segment in segments:
        if not isinstance(segment, dict) or segment.get('speaker') not in {'petr', 'jarda', 'lubo'}:
            raise ValueError('Neplatný mluvčí.')
        text = segment.get('text')
        if not isinstance(text, str) or not text.strip():
            raise ValueError('Prázdná replika.')
        words += len(text.split())
        speakers.add(segment['speaker'])
    if speakers != {'petr', 'jarda', 'lubo'} or words < 8100:
        raise ValueError('Je potřeba všech tří mluvčích a alespoň 8100 slov (odhad 60 min).')
    return segments


def split_text(text, limit=600):
    # Bounded requests even when a model returns a long monologue.
    chunks, current = [], ''
    for word in text.split():
        while len(word) > limit:
            if current:
                chunks.append(current)
                current = ''
            chunks.append(word[:limit])
            word = word[limit:]
        if len(current) + len(word) + 1 > limit and current:
            chunks.append(current)
            current = ''
        current = (current + ' ' + word).strip()
    if current:
        chunks.append(current)
    return chunks


def main(episode, persist=False, custom_voices=False, session_id=None, download=True):
    segments = validate_episode(episode)
    from google.colab import files
    if not shutil.which('ffmpeg'):
        subprocess.run(['apt-get', 'update', '-qq'], check=True)
        subprocess.run(['apt-get', 'install', '-y', '-qq', 'ffmpeg'], check=True)
    import torch
    if not torch.cuda.is_available():
        raise RuntimeError('Zapni Runtime → Change runtime type → T4 GPU.')
    import numpy as np
    import soundfile as sf
    from omnivoice import OmniVoice

    root = Path('/content/podcastweb')
    if persist:
        from google.colab import drive
        drive.mount('/content/drive')
        root = Path('/content/drive/MyDrive/PodcastWeb')
    digest = hashlib.sha256(json.dumps(episode, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]
    if session_id is not None:
        import re
        if not re.fullmatch(r'[a-f0-9]{64}', session_id):
            raise ValueError('Neplatné ID relace.')
    work = root / (session_id or digest) / ('custom' if custom_voices else 'synthetic')
    work.mkdir(parents=True, exist_ok=True)
    (work / 'episode.json').write_text(json.dumps(episode, ensure_ascii=False, indent=2), encoding='utf-8')
    (work / 'transcript.txt').write_text('\n\n'.join(s['speaker'].upper() + ': ' + s['text'] for s in segments), encoding='utf-8')
    (work / 'sources.json').write_text(json.dumps(episode.get('sources', []), ensure_ascii=False, indent=2), encoding='utf-8')
    model = OmniVoice.from_pretrained('k2-fsa/OmniVoice', device_map='cuda:0', dtype=torch.float16)
    designs = {'petr': 'male, middle-aged, moderate pitch', 'jarda': 'male, middle-aged, low pitch', 'lubo': 'male, young adult, high pitch'}
    reference_text = 'Dobrý den. Dnes společně probereme nové technologie a jejich dopad na každodenní život.'
    prompts = {}
    for speaker, design in designs.items():
        reference = work / f'{speaker}-reference.wav'
        transcript = work / f'{speaker}-reference.txt'
        if not reference.exists() or not transcript.exists():
            if custom_voices:
                print(f'{speaker}: nahraj vlastní oprávněnou ukázku WAV (3–10 sekund).')
                uploaded = files.upload()
                wavs = [value for name, value in uploaded.items() if name.lower().endswith('.wav')]
                if len(wavs) != 1:
                    raise ValueError('Nahraj právě jeden WAV.')
                reference.write_bytes(wavs[0])
                info = sf.info(str(reference))
                if not 3 <= info.duration <= 10:
                    reference.unlink()
                    raise ValueError('Ukázka musí mít 3–10 sekund, bez automatického ořezávání.')
                spoken = input(f'{speaker}: přesný přepis celé ukázky: ').strip()
                if not spoken:
                    raise ValueError('Přepis nesmí být prázdný.')
            else:
                spoken = reference_text
                samples = model.generate(text=spoken, instruct=design)[0]
                sf.write(str(reference), samples, 24000)
            transcript.write_text(spoken, encoding='utf-8')
        prompts[speaker] = model.create_voice_clone_prompt(ref_audio=str(reference), ref_text=transcript.read_text(encoding='utf-8'))

    chunks = [(s['speaker'], part) for s in segments for part in split_text(s['text'])]
    paths = []
    for index, (speaker, text) in enumerate(chunks):
        key = hashlib.sha256((speaker + text).encode()).hexdigest()[:12]
        path = work / f'{index:05d}-{key}.wav'
        valid = False
        if path.exists():
            try:
                valid = sf.info(str(path)).frames > 0
            except (RuntimeError, ValueError):
                pass
        if not valid:
            samples = np.asarray(model.generate(text=text, voice_clone_prompt=prompts[speaker])[0])
            if samples.size == 0 or not np.isfinite(samples).all():
                raise ValueError(f'Vadné audio v úseku {index + 1}. Opakuj render.')
            temporary = path.with_suffix('.tmp.wav')
            sf.write(str(temporary), samples, 24000)
            temporary.replace(path)
        paths.append(path)
        print(f'{index + 1}/{len(chunks)} — {speaker}', flush=True)

    # Stream PCM to disk instead of repeatedly copying an hour-long in-memory mix.
    master = work / 'episode.wav'
    with sf.SoundFile(str(master), 'w', samplerate=24000, channels=1, subtype='PCM_16') as target:
        for path in paths:
            samples, rate = sf.read(str(path), dtype='float32')
            if rate != 24000:
                raise ValueError('Neočekávaná vzorkovací frekvence.')
            target.write(samples)
            target.write(np.zeros(4320, dtype='float32'))
    output = work / 'episode.mp3'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(master), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-codec:a', 'libmp3lame', '-b:a', '128k', '-metadata', 'title=' + str(episode.get('title', 'Podcast')), str(output)], check=True)
    duration = sf.info(str(master)).duration
    report = {'seconds': duration, 'minutes': duration / 60, 'minimumMet': duration >= 3600, 'chunks': len(chunks), 'directory': str(work)}
    (work / 'report.json').write_text(json.dumps(report, indent=2))
    print(f'Render: {duration / 60:.1f} minut. Soubory: {work}')
    if duration < 3600:
        print('Skutečné audio je kratší než hodina; odhad scénáře není naměřená délka. Rozšiř scénář před publikací.')
    if download:
        files.download(str(output))
        files.download(str(work / 'episode.json'))
    # Free GPU memory before a possible extension render in the same runtime.
    del model
    torch.cuda.empty_cache()
    return report


if __name__ == '__main__':
    from google.colab import files
    if not EPISODE:  # injected by the notebook builder, never contains API keys
        uploaded = files.upload()
        choices = [data for name, data in uploaded.items() if name.endswith('.json')]
        if len(choices) != 1:
            raise ValueError('Vyber právě jeden JSON scénář.')
        EPISODE = json.loads(choices[0])
    main(EPISODE, SAVE_TO_DRIVE, USE_CUSTOM_VOICES)
