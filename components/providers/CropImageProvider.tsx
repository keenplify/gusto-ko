/* eslint-disable @next/next/no-img-element */
"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import ReactCrop, {
  type ReactCropProps,
  type Crop,
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

type CropRequest = {
  file: File;
  title?: ReactNode;
  props: Partial<ReactCropProps>; // Store props here too
  resolve: (result: File) => void; // Resolve to a File
  reject: (reason?: string) => void;
};

type CropImageProps = Omit<CropRequest, "resolve" | "reject">;

type CropImageContextValue = {
  cropImage: (props: CropImageProps) => Promise<File>;
};

const CropImageContext = createContext<CropImageContextValue | undefined>(
  undefined
);

// --- Helper Functions for Cropping ---

/** Converts the cropped area to a new File object */
async function getCroppedImageFile(
  image: HTMLImageElement,
  pixelCrop: Crop,
  fileName: string,
  fileType: string
): Promise<File> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Draw the section of the image we want to crop
  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas to Blob failed"));
        return;
      }
      // Create a new File object from the blob
      const croppedFile = new File([blob], fileName, { type: fileType });
      resolve(croppedFile);
    }, fileType);
  });
}

/** Utility to center the initial crop */
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

// --- Custom Hooks ---

export function useCropImage() {
  const ctx = useContext(CropImageContext);
  if (!ctx)
    throw new Error("useCropImage must be used inside <CropImageProvider>");
  return ctx.cropImage;
}

// --- Provider Component ---

export function CropImageProvider({ children }: { children: ReactNode }) {
  const [currentRequest, setCurrentRequest] = useState<CropRequest | null>(
    null
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [src, setSrc] = useState<string>(""); // State for Base64 image URL
  const [crop, setCrop] = useState<Crop>();
  const [cropProps, setCropProps] = useState<Partial<ReactCropProps>>({});

  // 1. Initiate Crop Request
  const cropImage = useCallback(({ file, props, title }: CropImageProps) => {
    return new Promise<File>((resolve, reject) => {
      setCurrentRequest({ file, props, title, resolve, reject });
    });
  }, []);

  // 2. Handle Image Loading and Modal Visibility
  useEffect(() => {
    if (currentRequest) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Set the Base64 source
        setSrc(reader.result as string);
        setCropProps(currentRequest.props);
        setCrop(undefined); // Reset crop state for the new image
        dialogRef.current?.showModal();
      };
      reader.onerror = () => {
        currentRequest.reject("Failed to read image file.");
        setCurrentRequest(null);
      };
      reader.readAsDataURL(currentRequest.file);
    } else {
      dialogRef.current?.close();
      setSrc("");
    }
    // Cleanup function for object URLs if we used URL.createObjectURL (but we used FileReader)
  }, [currentRequest]);

  // 3. Handle ReactCrop Image Load and Initial Crop Setup
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imageRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;

    // Set an initial crop if an aspect is provided
    if (cropProps.aspect) {
      const initialCrop = centerAspectCrop(width, height, cropProps.aspect);
      setCrop(initialCrop);
    }
  };

  // 4. Resolve the Promise (User Clicks "Crop")
  const finishCrop = async () => {
    if (!currentRequest || !crop || !imageRef.current) return;

    // We need the pixel-based crop values relative to the original image size
    const pixelCrop = convertToPixelCrop(
      crop,
      imageRef.current.width,
      imageRef.current.height
    );

    try {
      const resultFile = await getCroppedImageFile(
        imageRef.current,
        pixelCrop,
        currentRequest.file.name,
        currentRequest.file.type
      );

      currentRequest.resolve(resultFile);
      setCurrentRequest(null);
      setCrop(undefined); // Clear crop state
    } catch (error) {
      console.error(error);
      currentRequest.reject("Error generating cropped image.");
      setCurrentRequest(null);
    }
  };

  // 5. Reject the Promise (User Clicks "Cancel")
  const cancelCrop = () => {
    if (currentRequest) {
      currentRequest.reject("User canceled cropping");
      setCurrentRequest(null);
      setCrop(undefined); // Clear crop state
    }
  };

  return (
    <CropImageContext.Provider value={{ cropImage }}>
      {children}
      <dialog ref={dialogRef} id="crop_image_modal" className="modal">
        {currentRequest &&
          src && ( // Only render the contents if we have a request and the source is loaded
            <div className="modal-box flex flex-col gap-4 max-w-2xl w-full">
              <h3 className="font-bold text-lg">
                {currentRequest.title || "Crop Image"}
              </h3>
              <div
                className="flex justify-center p-4 bg-gray-100 rounded 
                          grow overflow-y-auto max-h-[calc(100vh-160px)] aspect-square"
              >
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCrop(c)}
                  ruleOfThirds={true}
                  {...cropProps}
                >
                  {/* The image component that ReactCrop wraps.
                  It uses the base64 src generated from the file.
                */}
                  <img
                    src={src}
                    alt="Cropped image preview"
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
              <div className="modal-action mt-0 pt-0">
                <button
                  className="btn btn-primary"
                  onClick={finishCrop}
                  // Disable if no crop selection has been made
                  disabled={!crop?.width || !crop?.height}
                >
                  Crop and Save
                </button>
                <form method="dialog">
                  <button className="btn" onClick={cancelCrop}>
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}
      </dialog>
    </CropImageContext.Provider>
  );
}
