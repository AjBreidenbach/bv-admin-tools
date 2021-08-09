#!/usr/bin/env bash

env PYTHON_CONFIGURE_OPTS="--enable-shared" pyenv install 3.7.10
pipenv install
pipenv run ./pipenv_shell.sh
