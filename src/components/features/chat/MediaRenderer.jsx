import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import style from "./MediaRenderer.module.css";

export default function MediaRenderer() {
  return (
    <div className={style.backgroundContainer}>
      Media Renderer
    </div>
  );
}

