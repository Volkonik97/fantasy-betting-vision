
import React from "react";
import Navbar from "@/components/Navbar";
import PlayerImagesContainer from "@/components/player/image-management/PlayerImagesContainer";

const PlayerImages = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        <PlayerImagesContainer />
      </div>
    </div>
  );
};

export default PlayerImages;
