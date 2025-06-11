import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const COURSE_LIST = [
  "Virpiniemi Golf",
  "Tammer-Golf",
  "Espoo Ringside Golf",
  "Helsinki Golf Club",
  "Kytäjä Golf",
];
type Player = { name: string; hcp: number };
const PLAYER_LIST = [
  { name: "Test test1", hcp: 8 },
  { name: "Test test2", hcp: 14 },
  { name: "Test test3", hcp: -5 },
  { name: "Test test4", hcp: 10 },
  { name: "Test test5", hcp: 18 },
];

type OptionRowProps = {
  label: string;
  value: string;
  onClick: () => void;
};

const OptionRow = ({ label, value, onClick }: OptionRowProps) => (
  <div
    className="flex justify-between items-center bg-white rounded-2xl px-4 py-3 cursor-pointer"
    onClick={onClick}
  >
    <span className="font-bold text-gray-700">{label}</span>
    <span className="text-gray-800 font-medium">{value}</span>
  </div>
);

const StartRoundPage = () => {
  const [course, setCourse] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [mode, setMode] = useState("Stroke Play");
  const [holes, setHoles] = useState(18);
  const [playerNames, setPlayerNames] = useState<string[]>([""]);
  const [modalType, setModalType] = useState<
    null | "mode" | "holes" | "player"
  >(null);
  const navigate = useNavigate();
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerSuggestions, setPlayerSuggestions] = useState<Player[]>([]);
  const [manualPlayer, setManualPlayer] = useState<{
    name: string;
    hcp: string;
  }>({
    name: "",
    hcp: "",
  });
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

  const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setCourse(input);
    setFilteredCourses(
      input
        ? COURSE_LIST.filter((c) =>
            c.toLowerCase().includes(input.toLowerCase())
          )
        : []
    );
  };

  const handleStart = () => {
    const validPlayers = selectedPlayers.filter(
      (p) => p.name.trim() !== "" && !isNaN(p.hcp)
    );
    if (course.trim() === "") {
      alert("Please select a course.");
      return;
    }
    if (validPlayers.length === 0) {
      alert("Please add at least one player.");
      return;
    }
    if (mode.trim() === "") {
      alert("Please select a mode.");
      return;
    }
    if (holes !== 9 && holes !== 18) {
      alert("Please select a valid number of holes (9 or 18).");
      return;
    }
    if (validPlayers.length > 4) {
      alert("You can only add up to 4 players.");
      return;
    }

    console.log("Course:", course);
    console.log("Mode:", mode);
    console.log("Holes:", holes);
    console.log("Selected Players:", selectedPlayers);

    navigate("/score");
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-grey-50 min-h-screen relative">
      <h1 className="text-3xl font-bold text-center mb-6">Start New Round</h1>

      {/* Course Input */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Course Name"
          value={course}
          onChange={handleCourseChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        {filteredCourses.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-md max-h-40 overflow-y-auto">
            {filteredCourses.map((c, index) => (
              <li
                key={index}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => {
                  setCourse(c);
                  setFilteredCourses([]);
                }}
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-center bg-white rounded-2xl text-gray-600 mb-4">
        <div className="space-y-4 mt-4">
          <OptionRow
            label="Mode"
            value={mode}
            onClick={() => setModalType("mode")}
          />
          <OptionRow
            label="Holes"
            value={`${holes} Holes`}
            onClick={() => setModalType("holes")}
          />
          <OptionRow
            label="Players"
            value={
              playerNames.filter((name) => name.trim() !== "").length > 0
                ? `${playerNames.length} Player${
                    playerNames.length > 1 ? "s" : ""
                  }`
                : "Not set"
            }
            onClick={() => setModalType("player")}
          />
        </div>
        <div className="mt-6">
          {selectedPlayers.length > 0 && (
            <div className="bg-white rounded-xl p-4 mt-4 shadow space-y-2">
              <h3 className="font-bold text-lg mb-2">Players</h3>
              {selectedPlayers.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded"
                >
                  <span>{p.name}</span>
                  <span className="text-gray-500 text-sm">
                    hcp {p.hcp < 0 ? `+${Math.abs(p.hcp)}` : p.hcp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleStart}
        className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
      >
        Start Round
      </button>

      {/* MODE Modal */}
      {modalType === "mode" && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-white p-6 rounded-xl w-80 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-lg mb-4">Select Mode</h2>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                setModalType(null);
              }}
              className="w-full p-2 border rounded"
            >
              <option value="Stroke Play">Stroke Play</option>
              <option value="Match Play">Match Play</option>
              <option value="Fun Round">Fun Round</option>
            </select>
          </div>
        </div>
      )}

      {/* HOLES Modal */}
      {modalType === "holes" && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-white p-6 rounded-xl w-80 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-lg mb-4">Select Holes</h2>
            <select
              value={holes}
              onChange={(e) => {
                setHoles(parseInt(e.target.value));
                setModalType(null);
              }}
              className="w-full p-2 border rounded"
            >
              <option value={9}>9 Holes</option>
              <option value={18}>18 Holes</option>
            </select>
          </div>
        </div>
      )}

      {/* PLAYERS Modal */}
      {modalType === "player" && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-white p-6 rounded-xl w-80 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-lg mb-4">Add Player</h2>

            <input
              type="text"
              value={playerSearch}
              onChange={(e) => {
                const input = e.target.value;
                setPlayerSearch(input);
                if (input.length > 0) {
                  setPlayerSuggestions(
                    PLAYER_LIST.filter((p) =>
                      p.name.toLowerCase().includes(input.toLowerCase())
                    )
                  );
                } else {
                  setPlayerSuggestions([]);
                }
              }}
              className="w-full p-2 border rounded mb-2"
              placeholder="Search player name"
            />

            {playerSuggestions.length > 0 && (
              <ul className="border rounded mb-2 max-h-40 overflow-y-auto">
                {playerSuggestions.map((p, i) => (
                  <li
                    key={i}
                    className="p-2 hover:bg-blue-100 cursor-pointer flex justify-between"
                    onClick={() => {
                      setSelectedPlayers((prev) => [...prev, p]);
                      setPlayerSearch("");
                      setPlayerSuggestions([]);
                    }}
                  >
                    <span>{p.name}</span>
                    <span className="text-gray-500 text-sm">hcp {p.hcp}</span>
                  </li>
                ))}
              </ul>
            )}
            {/* Selected Players Preview in Modal */}
            {selectedPlayers.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Selected Players</h3>
                <ul className="space-y-2">
                  {selectedPlayers.map((p, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-100 p-2 rounded"
                    >
                      <div>
                        <span className="font-medium">{p.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          hcp {p.hcp < 0 ? `+${Math.abs(p.hcp)}` : p.hcp}
                        </span>
                      </div>
                      <button
                        className="text-red-500 font-bold text-lg"
                        onClick={() =>
                          setSelectedPlayers((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Manual Entry */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                placeholder="Name"
                value={manualPlayer.name}
                onChange={(e) =>
                  setManualPlayer({ ...manualPlayer, name: e.target.value })
                }
                className="flex-1 p-2 border rounded"
              />
              <input
                type="text"
                placeholder="HCP"
                value={manualPlayer.hcp.toString()}
                onChange={(e) =>
                  setManualPlayer({
                    ...manualPlayer,
                    hcp: e.target.value,
                  })
                }
                className="w-20 p-2 border rounded"
              />
              <button
                className="bg-blue-500 text-white px-3 py-2 rounded"
                onClick={() => {
                  const hcpValue = parseFloat(manualPlayer.hcp);
                  if (!manualPlayer.name || isNaN(hcpValue)) return;
                  setSelectedPlayers((prev) => [
                    ...prev,
                    { name: manualPlayer.name, hcp: hcpValue },
                  ]);
                  setManualPlayer({ name: "", hcp: "" });
                }}
              >
                Add
              </button>
            </div>

            <button
              onClick={() => setModalType(null)}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default StartRoundPage;
