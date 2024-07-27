# The Solution

## Refactor

I first started by refactoring the project to add another canvas as if I were to
implement canvas clearing and image upload clearing, both buttons would clear
the user's drawing.

This could have been accomplished by saving an array of the `moveTo` and
`lineTo` canvas commands as well, however compositing using drawImage is quite
quick and slightly easier to achieve.

I decided to spend more time on this section to demonstrate equally my
knowledge of React and `CanvasRenderingContext2D`.

## File upload

This was quite simple to implement, `FileReader` is the star of the show here.  
It reads the uploaded file as a data URL, which is a base64 encoded string.  
Once this is created by the reader using `readAsDataURL`, the
attached event listener for `load` is run.

A new `Image` is created, an event listener for `load` is also set on the
`Image`. The base64 string provided by the `FileReader` is set on the `src`
property of `Image` and the browser loads the uploaded `Image`.

We save this new image to the React component state and a `useEffect` with
`uploadedImage` as a dependancy causes the `composite` function to run and the
newly uploaded image is drawn to the canvas, then the user's drawing on top.

`composite` handles the scaling of the uploaded image.

## Basic UI components

I made these more generic in their usage, now accepting any props.

The `Input` component was wrapped in a `forwardRef` to allow clearing the input
value on click of `Clear uploaded image`, resetting the file input.
