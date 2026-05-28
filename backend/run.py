#!/usr/bin/env python3
"""Development entry point for Calmora backend."""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="127.0.0.1", port=8000, reload=True)