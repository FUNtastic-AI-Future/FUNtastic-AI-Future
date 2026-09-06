"""Render an existing episode locally on Apple MPS/CUDA."""
import json
import os
import sys
import types
import importlib.machinery
from pathlib import Path

root = Path(__file__).resolve().parents[1]
episode_path = Path(os.environ.get('EPISODE_JSON', '/Users/emperor/Downloads/episode.json'))
episode = json.loads(episode_path.read_text(encoding='utf-8'))
session = '2d44ac2d6d6080642a72d18f2bc75ced30ab16e1f667da18515e70a20a0c68de'
work_root = Path('/Users/emperor/Downloads/FantasticFuture-render')
voice_dir = work_root / session / 'custom-v2'
voice_dir.mkdir(parents=True, exist_ok=True)
source_dir = Path('/Users/emperor/dev/local/FantasticFuture/clips')
for speaker, stem in [('petr', 'petr_mara_clean'), ('jarda', 'jaroslav_beck_clean'), ('lubo', 'lubo_smid_clean')]:
    (voice_dir / f'{speaker}-reference.wav').write_bytes((source_dir / f'{stem}.wav').read_bytes())
    (voice_dir / f'{speaker}-reference.txt').write_text((source_dir / f'{stem}.txt').read_text(encoding='utf-8'), encoding='utf-8')

files = types.ModuleType('google.colab.files')
files.__spec__ = importlib.machinery.ModuleSpec('google.colab.files', loader=None)
files.download = lambda path: print(f'Výstup: {path}')
colab = types.ModuleType('google.colab')
colab.__spec__ = importlib.machinery.ModuleSpec('google.colab', loader=None)
colab.files = files
google = types.ModuleType('google')
google.__spec__ = importlib.machinery.ModuleSpec('google', loader=None)
google.colab = colab
sys.modules.update({'google': google, 'google.colab': colab, 'google.colab.files': files})
sys.path.insert(0, str(root / 'colab'))
from render_episode import main

os.environ['PODCASTWEB_ROOT'] = str(work_root)
report = main(episode, persist=False, custom_voices=True, session_id=session, download=False)
print(json.dumps(report, ensure_ascii=False))
