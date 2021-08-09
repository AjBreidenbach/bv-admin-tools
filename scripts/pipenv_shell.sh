#!/usr/bin/env bash

if [ -z "$PYENV_ROOT" ]
then
  PYENV_ROOT=$HOME/.pyenv
fi

export LIBRARY_PATH="$PYENV_ROOT/versions/3.7.10/lib/:$LIBRARY_PATH"
export PY_INCLUDE=$(python build_include.py)
export PY_LIBS=$(python build_ldflags.py)

echo "LD_LIBRARY_PATH=$PYENV_ROOT/versions/3.7.10/lib/:$LD_LIBRARY_PATH" >> .env

npm i
