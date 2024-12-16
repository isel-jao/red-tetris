import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/home";
import RoomPage from "./pages/room";
import PlayerPage from "./pages/player";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<HomePage />} />
          <Route path=":room">
            <Route index element={<RoomPage />} />
            <Route path=":playerName" element={<PlayerPage />} />
          </Route>
        </Route>
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
