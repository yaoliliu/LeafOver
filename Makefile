preview:
	python3 run.py

fetch-example:
	python3 scripts/fetch_jit.py

test:
	python3 -m unittest discover -s tests -p 'test_preview*.py'
	node tests/check_settings_latency.js

.PHONY: preview fetch-example test
