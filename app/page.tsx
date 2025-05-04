"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Card {
  id: number;
  value: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const generateCards = (): Card[] => {
  const values = Array.from({ length: 10 }, (_, i) => i + 1); // Numbers 1 to 10
  const cardPairs = [...values, ...values];
  const shuffledPairs = cardPairs.sort(() => Math.random() - 0.5);
  return shuffledPairs.map((value, index) => ({
    id: index,
    value,
    isFlipped: false,
    isMatched: false,
  }));
};

export default function HomePage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const initializeGame = useCallback(() => {
    setCards(generateCards());
    setFlippedIndices([]);
    setMoves(0);
    setTimer(0);
    setTimerActive(false);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && !gameOver) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else if (!timerActive || gameOver) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, gameOver]);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [firstIndex, secondIndex] = flippedIndices;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.value === secondCard.value) {
        // Match found
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === firstCard.id || card.id === secondCard.id
              ? { ...card, isMatched: true }
              : card
          )
        );
        setFlippedIndices([]);
      } else {
        // No match, flip back after a delay
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card, index) =>
              index === firstIndex || index === secondIndex
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedIndices([]);
        }, 1000); // 1 second delay
      }
      setMoves((prevMoves) => prevMoves + 1);
    }
  }, [flippedIndices, cards]);

  useEffect(() => {
    // Check for game over
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setGameOver(true);
      setTimerActive(false);
    }
  }, [cards]);

  const handleCardClick = (index: number) => {
    if (!timerActive && !gameOver) {
      setTimerActive(true); // Start timer on first click
    }

    if (
      gameOver ||
      flippedIndices.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) {
      return; // Ignore click if game over, 2 cards already flipped, card already flipped, or card already matched
    }

    // Flip the card
    setCards((prevCards) =>
      prevCards.map((card, i) =>
        i === index ? { ...card, isFlipped: true } : card
      )
    );

    setFlippedIndices((prevIndices) => [...prevIndices, index]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Memory Game</h1>
      <div className="flex justify-between w-full max-w-md mb-4">
        <div className="text-lg">Moves: {moves}</div>
        <div className="text-lg">Time: {timer}s</div>
      </div>
      <div className="grid grid-cols-5 gap-4 mb-6">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`card ${
              card.isFlipped || card.isMatched ? "flipped" : ""
            } ${card.isMatched ? "matched" : ""}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">
                {/* You can replace this with an icon or image */}?
              </div>
              <div className="card-back">{card.value}</div>
            </div>
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            You Won!
          </h2>
          <button
            onClick={initializeGame}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Play Again?
          </button>
        </div>
      )}
      {!gameOver && cards.length > 0 && !timerActive && moves === 0 && (
        <button
          onClick={() => setTimerActive(true)} // Allow manual start if needed, though first click starts it
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 mt-4"
        >
          Start Timer
        </button>
      )}
    </main>
  );
}
