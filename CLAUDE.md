# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a client-side hash identifier tool that analyzes input strings to determine which hash algorithm (MD5, SHA-1, SHA-256, etc.) was likely used to generate them. The application is a simple HTML/CSS/JavaScript web app that runs entirely in the browser.

## Architecture

- **Frontend-only**: Pure HTML/CSS/JavaScript with no backend dependencies
- **Single-page application**: All functionality contained in `index.html`
- **Pattern matching**: Uses regex patterns to identify hash types based on format and length
- **No external dependencies**: Self-contained application

## Key Components

- `index.html`: Main UI with input field, result display, and test hash examples
- `script.js`: Core logic containing hash identification patterns and DOM manipulation
- `style.css`: Styling for the interface
- Test hashes are embedded in HTML for quick testing

## Hash Detection Logic

The tool identifies hashes using regex patterns in `script.js`:
- MD5: 32 hex characters
- SHA-1: 40 hex characters  
- SHA-256: 64 hex characters
- SHA-512: 128 hex characters
- bcrypt: Starts with `$2a$`, `$2b$`, etc.
- NTLM: 32 uppercase hex characters

The `identifyHash()` function processes input and updates the result display immediately.

## Development Notes

- No build process or package management
- Can be opened directly in browser for testing
- GitHub Pages deployment ready (served from root)
- All text is in Japanese
- Real-time input validation via event listeners