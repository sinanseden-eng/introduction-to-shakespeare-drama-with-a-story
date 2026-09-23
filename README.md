# The Second Bell

An original interactive time-travel story set in a playhouse just before a performance of *Romeo and Juliet*. The five-chapter digital booklet teaches literary devices, poetry techniques, iambic pentameter, and selected words from Shakespeare's period through clickable moments in the narrative.

## Reading features

- Click highlighted passages for a definition, an explanation in context, and a further example or prompt.
- Navigate by chapter tabs or Previous and Next; use the index to jump to an idea.
- Revisit discovered ideas. Discovery progress is saved in the current browser.
- Open the “Pause & think” question at the end of each chapter.
- The layout adapts to tablets and phones. The note panel becomes a bottom sheet on small screens.

The story contains ten literary devices (foreshadowing, contrast, dramatic irony, ethical dilemma, paradox, irony, ambiguity, symbolism, metaphor, juxtaposition), four poetry and rhythm ideas (iambic pentameter, wrenching, enjambment, caesura), and twelve earlier English words.

## Run locally

This is a static site with no dependencies or build step. Serve the repository folder with any HTTP server:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Netlify

Import this GitHub repository as a new Netlify project. `netlify.toml` publishes the repository root, with no build command. This repository is independent from `introduction-to-shakespeare-drama`.
