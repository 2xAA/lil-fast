import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
} from "react";

// Basic UI components
const Button = ({ children, className, ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}
  >
    {children}
  </button>
);

const Input = forwardRef(({ className, ...props }, ref) => (
  <input
    {...props}
    ref={ref}
    className={`border rounded px-2 py-1 ${className}`}
  />
));

const Select = ({ children, className, ...props }) => (
  <select {...props} className={`border rounded px-2 py-1 ${className}`}>
    {children}
  </select>
);

const CanvasDrawingApp = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [drawingCanvas, setDrawingCanvas] = useState(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [numIterations, setNumIterations] = useState(2);
  const [generatedImage, setGeneratedImage] = useState(null);

  // TODO: Add state for uploaded image
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    // Create a canvas to draw the pain strokes to.
    // If we want to clear the image or the drawing we can save either by using
    // the canvas in the DOM as a composite canvas.
    const drawingCanvas = document.createElement("canvas");
    setDrawingCanvas(drawingCanvas);

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    drawingCanvas.width = canvas.width;
    drawingCanvas.height = canvas.height;

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleImageUpload = (e) => {
    const [file] = e.target.files;
    const reader = new FileReader();

    reader.addEventListener("load", () => {
        const image = new Image();

        image.addEventListener("load", () => {
          setUploadedImage(image);
        });

        image.src = reader.result;
      },
      false
    );

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const startDrawing = (e) => {
    const canvas = drawingCanvas;
    const compositeCanvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = compositeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const composite = useCallback(() => {
    const compositeCanvas = canvasRef.current;
    const compositeContext = compositeCanvas.getContext("2d");
    const { width: canvasWidth, height: canvasHeight } = compositeCanvas;

    compositeContext.fillRect(0, 0, canvasWidth, canvasHeight);

    if (!drawingCanvas) {
      return;
    }

    if (uploadedImage) {
      const { width: imgWidth, height: imgHeight } = uploadedImage;
      const imgAspectRatio = imgWidth / imgHeight;
      const canvasAspectRatio = canvasWidth / canvasHeight;

      let drawWidth, drawHeight;

      if (imgAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas aspect ratio
        drawWidth = canvasWidth;
        drawHeight = drawWidth / imgAspectRatio;
      } else {
        // Image is taller than canvas aspect ratio
        drawHeight = canvasHeight;
        drawWidth = drawHeight * imgAspectRatio;
      }

      // Calculate the position to center the image on the canvas
      const drawX = (canvasWidth - drawWidth) / 2;
      const drawY = (canvasHeight - drawHeight) / 2;

      compositeContext.drawImage(
        uploadedImage,
        drawX,
        drawY,
        drawWidth,
        drawHeight
      );
    }

    compositeContext.drawImage(drawingCanvas, 0, 0);
  }, [drawingCanvas, uploadedImage]);

  // Draw uploaded image when state updated
  useEffect(() => {
    composite();
  }, [composite, uploadedImage]);

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = drawingCanvas;
    const compositeCanvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = compositeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.stroke();

    composite();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = drawingCanvas;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    clearCompositeCanvas();

    composite();
  };

  const clearCompositeCanvas = () => {
    const compositeCanvas = canvasRef.current;
    const compositeContext = compositeCanvas.getContext("2d");

    compositeContext.clearRect(
      0,
      0,
      compositeCanvas.width,
      compositeCanvas.height
    );
  };

  const clearUploadedImage = () => {
    fileInputRef.current.value = "";
    clearCompositeCanvas();

    if (uploadedImage === null) {
      composite();
    }
    setUploadedImage(null);
  };
   

  const sendToServer = async () => {
    const canvas = canvasRef.current;
    const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    
    const formData = new FormData();
    formData.append('image', imageBlob, 'drawing.png');
    formData.append('prompt', prompt);
    formData.append('num_iterations', numIterations.toString());

    try {
      const response = await fetch('https://lightnote-ai--img-model-inference.modal.run', {
        method: 'POST',
        body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Server response was not ok');
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate image. Please try again.');
    }
  };

  

  return (
    <div className="flex flex-col items-center p-4">
      
      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        className="border border-gray-300"
      />
      <div className="mt-4 space-y-2 w-full max-w-md">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full"
        />
        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full"
        />
        <Select
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-full"
        >
          <option value="2">Small</option>
          <option value="5">Medium</option>
          <option value="10">Large</option>
        </Select>
        <Input
          type="text"
          placeholder="Enter prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full"
        />
        <Select
          value={numIterations}
          onChange={(e) => setNumIterations(Number(e.target.value))}
          className="w-full"
        >
          <option value="1">Rapid</option>
          <option value="10">Enhanced</option>
        </Select>
        <Button onClick={clearCanvas} className="w-full">Clear Drawing</Button>
        <Button onClick={clearUploadedImage} className="w-full">Clear Uploaded Image</Button>
        <Button onClick={sendToServer} className="w-full">Send to Server</Button>
      </div>
      {generatedImage && (
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-2">Generated Image:</h2>
          <img src={generatedImage} alt="Generated" className="max-w-full h-auto" />
        </div>
      )}
    </div>
  );
};

export default CanvasDrawingApp;
