import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/axiosConfig";
import { getDetailPath, getDisplayTitle, posterUrl } from "@/lib/tmdb";
import "@/styles/HeroPosterStack.css";

function HeroPosterStack() {
  const [posters, setPosters] = useState([null, null, null]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get("/trending/all/week?page=1")
      .then((res) => {
        const results = (res.data.results || []).filter(
          (m) => m.poster_path && (m.media_type === "movie" || m.media_type === "tv")
        );
        setPosters([results[0] || null, results[1] || null, results[2] || null]);
      })
      .catch(console.error);
  }, []);

  const handleClick = (item) => {
    if (!item) return;
    navigate(getDetailPath(item.media_type, item.id));
  };

  return (
    <div className="hero-stack">
      {posters.map((item, i) => (
        <div
          key={i}
          className={`hero-stack__card hero-stack__card--${i}`}
          onClick={() => handleClick(item)}
          role={item ? "link" : undefined}
          tabIndex={item ? 0 : undefined}
          onKeyDown={(e) => e.key === "Enter" && handleClick(item)}
          title={getDisplayTitle(item)}
        >
          {item?.poster_path ? (
            <img
              src={posterUrl(item.poster_path)}
              alt={getDisplayTitle(item)}
              draggable={false}
            />
          ) : (
            <div className="hero-stack__placeholder" />
          )}
        </div>
      ))}
    </div>
  );
}

export default HeroPosterStack;