
import React from "react";
import Navbar from "@/components/Navbar";
import PlayerImagesContainer from "@/components/player/image-management/PlayerImagesContainer";

const PlayerImages = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <PlayerImagesContainer />
    </div>
  );
};

export default PlayerImages;
