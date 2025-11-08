// src/SwipeDeck.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "react-spring";
import { useDrag } from "@use-gesture/react";

export default function SwipeDeck({ totalCats = 10 }) {
  const [stack, setStack] = useState([]);       // Preloaded cards
  const [processed, setProcessed] = useState(0);
  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);

  const isMounted = useRef(true);
  const preloadCount = 3;
  const SWIPE_THRESHOLD = 60;

  // On mount: preload initial cards
  useEffect(() => {
    isMounted.current = true;

    (async () => {
      const urls = await Promise.all(
        Array.from({ length: preloadCount }).map(fetchCatUrl)
      );
      if (!isMounted.current) return;
      setStack(urls);
      setLoading(false);
    })();

    return () => { isMounted.current = false; };
  }, []);

  // Fetch and preload a cat image
  async function fetchCatUrl() {
    const url = `https://cataas.com/cat?${Math.random()}`;
    await new Promise((res) => {
      const img = new Image();
      img.src = url;
      img.onload = res;
      img.onerror = res;
    });
    return url;
  }

  const pushNextIntoStack = async () => {
    const next = await fetchCatUrl();
    if (!isMounted.current) return;
    setStack((s) => [...s, next]);
  };

  const onCardSwiped = (direction, cardUrl) => {
    if (direction === "right") setLiked((l) => [...l, cardUrl]);
    else setDisliked((d) => [...d, cardUrl]);

    setProcessed((p) => {
      const np = p + 1;
      if (np < totalCats) pushNextIntoStack();
      if (np >= totalCats) setTimeout(() => setShowSummary(true), 250);
      return np;
    });

    // Remove the top card
    setStack((s) => s.slice(1));
  };

  // Summary screen
  if (showSummary) {
    return (
      <div className="bg-[#0f1724] p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-3">Session Complete 🎉</h2>
        <p className="text-center text-slate-300 mb-6">
          You liked <span className="text-pink-300 font-semibold">{liked.length}</span> out of <span className="font-semibold text-slate-100">{totalCats}</span> cats.
        </p>

        {liked.length ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {liked.map((url, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border-2 border-pink-400">
                <img src={url} alt={`liked-${i}`} className="w-full h-32 object-cover" />
                <div className="absolute -top-2 -right-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs">❤️</div>
              </div>
            ))}
          </div>
        ) : <p className="text-slate-400 mb-4">You didn’t like any cats this session.</p>}

        <div className="flex justify-center">
          <button
            className="px-4 py-2 rounded bg-pink-500 hover:bg-pink-600 transition"
            onClick={async () => {
              setProcessed(0);
              setLiked([]);
              setDisliked([]);
              setShowSummary(false);
              setLoading(true);
              const urls = await Promise.all(
                Array.from({ length: preloadCount }).map(fetchCatUrl)
              );
              if (!isMounted.current) return;
              setStack(urls);
              setLoading(false);
            }}
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  // Loader if stack is empty
  if (loading && stack.length === 0) {
    return (
      <div className="bg-[#0f1724] p-6 rounded-2xl shadow-xl flex items-center justify-center h-96">
        <div className="flex flex-col items-center text-slate-300">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-400 mb-4"></div>
          <p>Loading cats…</p>
        </div>
      </div>
    );
  }

  const visibleStack = stack.slice(0, 3).reverse(); // Top 3 cards

  return (
    <div className="relative">
      <div className="bg-[#0f1724] p-4 rounded-2xl shadow-xl">
        <div className="relative w-full h-96 flex items-center justify-center">
          {visibleStack.length === 0 ? (
            <div className="text-slate-300">No more cards</div>
          ) : visibleStack.map((url, idx) => {
              const layer = visibleStack.length - 1 - idx;
              return <Card key={url} url={url} layer={layer} onSwiped={onCardSwiped} swipeThreshold={SWIPE_THRESHOLD} />;
            })}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-slate-300">Swiped: {processed} / {totalCats}</div>
          <div className="flex gap-3">
            <button
              onClick={() => stack.length && onCardSwiped("left", stack[0])}
              className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center">❌</button>
            <button
              onClick={() => stack.length && onCardSwiped("right", stack[0])}
              className="w-12 h-12 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-black font-bold">❤️</button>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">Images from cataas.com</p>
    </div>
  );
}

/* ==== Card component ==== */
function Card({ url, layer, onSwiped, swipeThreshold }) {
  const offsetY = layer * 8;
  const scale = 1 - layer * 0.03;
  const rotateOffset = layer * 2;

  const [style, api] = useSpring(() => ({ x: 0, y: offsetY, scale, rotate: rotateOffset }));

  const bind = useDrag(
    ({ active, movement: [mx], last }) => {
      if (active) api.start({ x: mx, rotate: mx / 15, scale: 1.03 });
      else if (last) {
        if (mx > swipeThreshold) api.start({ x: 800, rotate: 30, onRest: () => onSwiped("right", url) });
        else if (mx < -swipeThreshold) api.start({ x: -800, rotate: -30, onRest: () => onSwiped("left", url) });
        else api.start({ x: 0, y: offsetY, scale, rotate: rotateOffset, config: { tension: 300, friction: 25 } });
      }
    },
    { from: () => [style.x.get(), 0] }
  );

  return (
    <animated.div
      {...bind()}
      style={{
        x: style.x,
        y: style.y,
        scale: style.scale,
        rotate: style.rotate.to((r) => `${r}deg`),
        position: "absolute",
        width: "18rem",
        height: "24rem",
        willChange: "transform",
      }}
      className="rounded-xl overflow-hidden bg-slate-800 shadow-2xl"
    >
      <img src={url} alt="cat card" className="w-full h-full object-cover block" draggable="false" />
    </animated.div>
  );
}