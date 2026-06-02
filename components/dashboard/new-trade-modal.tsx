"use client";

import { useEffect, useMemo, useState } from "react";

export type Trade = {
  symbol: string;
  direction: string;
  entry: string;
  exit: string;
  quantity: string;
  pnl: string;
  reason: string;
  notes: string;
  date: string;
  image?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  initialData?: Trade | null;
};

const emotionalReasons = [
  "FOMO",
  "Pressure",
  "Anger",
  "Revenge Trading",
  "Overconfidence",
  "Fear",
  "Impulse Entry",
];

function getContractMultiplier(symbol: string) {
  const cleanSymbol = symbol.toUpperCase().trim();

  if (cleanSymbol === "NQ") return 20;
  if (cleanSymbol === "MNQ") return 2;
  if (cleanSymbol === "ES") return 50;
  if (cleanSymbol === "MES") return 5;

  return 1;
}

export default function NewTradeModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: Props) {
  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState("Long");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      setSymbol(initialData.symbol || "");
      setDirection(initialData.direction || "Long");
      setEntry(initialData.entry || "");
      setExit(initialData.exit || "");
      setQuantity(initialData.quantity || "");
      setReason(initialData.reason || "");
      setNotes(initialData.notes || "");
      setDate(initialData.date || "");
      setImage(initialData.image || "");
    } else {
      setSymbol("");
      setDirection("Long");
      setEntry("");
      setExit("");
      setQuantity("");
      setReason("");
      setNotes("");
      setDate("");
      setImage("");
    }
  }, [initialData, isOpen]);

  const contractMultiplier = useMemo(
    () => getContractMultiplier(symbol),
    [symbol]
  );

  const pnl = useMemo(() => {
    const entryValue = Number(entry);
    const exitValue = Number(exit);
    const quantityValue = Number(quantity);

    if (!entryValue || !exitValue || !quantityValue) {
      return "0.00";
    }

    const points =
      direction === "Long"
        ? exitValue - entryValue
        : entryValue - exitValue;

    return (points * quantityValue * contractMultiplier).toFixed(2);
  }, [entry, exit, quantity, direction, contractMultiplier]);

  if (!isOpen) return null;

  function saveTrade() {
    onSave({
      symbol,
      direction,
      entry,
      exit,
      quantity,
      pnl,
      reason,
      notes,
      date,
      image,
    });

    onClose();
  }

  function handleImageUpload(file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-[#0b0f14] p-6 text-white">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {initialData ? "Edit Trade" : "New Trade"}
            </h2>

            <p className="text-sm text-zinc-400">
              {initialData
                ? "Update your trade details."
                : "Log your trade and psychology."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Symbol - NQ / MNQ / ES / MES"
            className="rounded-xl bg-zinc-900 p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="rounded-xl bg-zinc-900 p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>Long</option>
            <option>Short</option>
          </select>

          <input
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Entry Price"
            type="number"
            className="rounded-xl bg-zinc-900 p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            value={exit}
            onChange={(e) => setExit(e.target.value)}
            placeholder="Exit Price"
            type="number"
            className="rounded-xl bg-zinc-900 p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Contracts"
            type="number"
            className="rounded-xl bg-zinc-900 p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div
            className={`flex flex-col items-center justify-center rounded-xl border py-3 text-center ${
              Number(pnl) >= 0
                ? "border-emerald-800 bg-emerald-950/30 text-emerald-400"
                : "border-red-800 bg-red-950/30 text-red-400"
            }`}
          >
            <span className="text-xs text-zinc-400">
              P&L × {contractMultiplier}
            </span>

            <span className="text-2xl font-bold">
              ${pnl}
            </span>
          </div>

          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="rounded-xl bg-zinc-900 p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-zinc-400">
              Trade Screenshot
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files?.[0])}
              className="w-full rounded-xl bg-zinc-900 p-3 text-white outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:font-bold file:text-black hover:file:bg-emerald-400"
            />

            {image && (
              <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
                <img
                  src={image}
                  alt="Trade screenshot"
                  className="max-h-48 w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-sm text-zinc-400">Emotional Reason</p>

          <div className="flex flex-wrap gap-2">
            {emotionalReasons.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setReason(item)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  reason === item
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          className="mt-5 min-h-28 w-full rounded-xl bg-zinc-900 p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </button>

          <button
            onClick={saveTrade}
            className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-black hover:bg-emerald-400"
          >
            {initialData ? "Save Changes" : "Save Trade"}
          </button>
        </div>
      </div>
    </div>
  );
}