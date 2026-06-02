import MoodPicker from "./MoodPicker";
import PhaseInsight from "./PhaseInsight";

function MoodJournal({ todayMood, getMoodEmoji, MOOD_TYPES, handleMoodSelect, currentPhase, phaseInfo }) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mood Journal</h1>
        <p className="text-gray-500">How are you feeling today?</p>
      </div>

      <MoodPicker 
        todayMood={todayMood} 
        getMoodEmoji={getMoodEmoji} 
        MOOD_TYPES={MOOD_TYPES} 
        handleMoodSelect={handleMoodSelect} 
      />

      <PhaseInsight 
        currentPhase={currentPhase} 
        phaseInfo={phaseInfo} 
      />
    </>
  );
}

export default MoodJournal;
