preview:
	./install.sh

install:
	./install.sh --install-only

test:
	python3 -m unittest discover -s tests -p 'test_*.py'
	node tests/check_settings_latency.js

.PHONY: preview install test
