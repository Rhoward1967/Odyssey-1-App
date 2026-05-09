import { useState } from 'react';
import { Button } from './ui/button';

interface Question {
  q: string;
  opts: string[];
  correct: number;
  exp: string;
}

type Subject = 'math' | 'science' | 'history' | 'english' | 'geography';
type Level = 'elementary' | 'middle' | 'high';

const QUESTIONS: Record<Subject, Record<Level, Question[]>> = {
  math: {
    elementary: [
      { q: 'What is 6 × 7?', opts: ['36', '42', '48', '54'], correct: 1, exp: '6 × 7 = 42. Count by 7s: 7, 14, 21, 28, 35, 42!' },
      { q: 'What is 144 ÷ 12?', opts: ['10', '11', '12', '13'], correct: 2, exp: '144 ÷ 12 = 12. It\'s in the 12 times table!' },
      { q: 'What is 25% of 80?', opts: ['15', '20', '25', '30'], correct: 1, exp: '25% = one quarter. 80 ÷ 4 = 20.' },
      { q: 'Round 3,847 to the nearest hundred.', opts: ['3,700', '3,800', '3,900', '4,000'], correct: 1, exp: 'The hundreds digit is 8. The tens digit is 4 (less than 5), so round down → 3,800.' },
      { q: 'What is the area of a rectangle 9cm wide and 4cm tall?', opts: ['26 cm²', '36 cm²', '13 cm²', '18 cm²'], correct: 1, exp: 'Area = length × width = 9 × 4 = 36 cm².' },
    ],
    middle: [
      { q: 'Solve: 3x + 7 = 22. What is x?', opts: ['3', '4', '5', '6'], correct: 2, exp: '3x = 22 − 7 = 15 → x = 15 ÷ 3 = 5.' },
      { q: 'What is the area of a triangle with base 8 and height 5?', opts: ['13', '20', '40', '80'], correct: 1, exp: 'Area = ½ × base × height = ½ × 8 × 5 = 20.' },
      { q: 'What is −3 × −4?', opts: ['−12', '−7', '7', '12'], correct: 3, exp: 'Negative × Negative = Positive. −3 × −4 = 12.' },
      { q: 'What is 2³?', opts: ['6', '8', '9', '12'], correct: 1, exp: '2³ = 2 × 2 × 2 = 8.' },
      { q: 'What is 15% of 200?', opts: ['20', '25', '30', '35'], correct: 2, exp: '15% = 10% + 5% = 20 + 10 = 30.' },
    ],
    high: [
      { q: 'What is the derivative of f(x) = x³?', opts: ['x²', '2x', '3x²', '3x'], correct: 2, exp: 'Power rule: d/dx[xⁿ] = nxⁿ⁻¹ → d/dx[x³] = 3x².' },
      { q: 'What is sin(90°)?', opts: ['0', '0.5', '1', '√2/2'], correct: 2, exp: 'sin(90°) = 1. At 90° the opposite side equals the hypotenuse.' },
      { q: 'Solve: x² − 5x + 6 = 0', opts: ['x=2, x=3', 'x=−2, x=−3', 'x=1, x=6', 'x=−1, x=−6'], correct: 0, exp: 'Factor: (x−2)(x−3)=0 → x=2 or x=3.' },
      { q: 'What is log₂(64)?', opts: ['4', '5', '6', '8'], correct: 2, exp: '2⁶ = 64, so log₂(64) = 6.' },
      { q: 'What is the slope of the line y = 3x − 7?', opts: ['−7', '3', '7', '−3'], correct: 1, exp: 'In y = mx + b, m is the slope. Here m = 3.' },
    ],
  },
  science: {
    elementary: [
      { q: 'What is the closest star to Earth?', opts: ['Alpha Centauri', 'The Sun', 'Sirius', 'Betelgeuse'], correct: 1, exp: 'The Sun is our nearest star — about 93 million miles away!' },
      { q: 'What gas do plants use for photosynthesis?', opts: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correct: 2, exp: 'Plants take in CO₂ and water, use sunlight to make food, and release oxygen.' },
      { q: 'How many bones does an adult human body have?', opts: ['106', '206', '306', '406'], correct: 1, exp: 'Adults have 206 bones. Babies start with ~270 — some fuse as we grow!' },
      { q: 'Which planet is called the Red Planet?', opts: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correct: 2, exp: 'Mars looks red because its surface is covered in iron oxide — basically rust!' },
      { q: 'What is the process of water turning into vapor called?', opts: ['Condensation', 'Evaporation', 'Precipitation', 'Freezing'], correct: 1, exp: 'Evaporation is when liquid water turns into water vapor due to heat.' },
    ],
    middle: [
      { q: 'What is the chemical symbol for gold?', opts: ['Go', 'Gd', 'Au', 'Ag'], correct: 2, exp: 'Au comes from the Latin word "aurum" meaning gold.' },
      { q: 'Which part of the cell is the control center?', opts: ['Cell wall', 'Mitochondria', 'Nucleus', 'Vacuole'], correct: 2, exp: 'The nucleus contains DNA — the instructions for everything the cell does.' },
      { q: 'What type of rock forms from cooled lava?', opts: ['Sedimentary', 'Metamorphic', 'Igneous', 'Limestone'], correct: 2, exp: 'Igneous rock forms when magma or lava cools and solidifies.' },
      { q: 'What is the chemical formula for water?', opts: ['HO', 'H₂O', 'H₂O₂', 'CO₂'], correct: 1, exp: 'Water = 2 hydrogen atoms + 1 oxygen atom = H₂O.' },
      { q: 'How many chromosomes do humans have?', opts: ['23', '44', '46', '48'], correct: 2, exp: 'Humans have 46 chromosomes arranged in 23 pairs.' },
    ],
    high: [
      { q: 'What is the powerhouse of the cell?', opts: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'], correct: 2, exp: 'Mitochondria produce ATP through cellular respiration — the cell\'s energy currency!' },
      { q: 'What is Newton\'s Second Law?', opts: ['F=ma', 'E=mc²', 'V=IR', 'PV=nRT'], correct: 0, exp: 'F = ma: Force equals mass times acceleration.' },
      { q: 'DNA stands for:', opts: ['Dynamic Nuclear Acid', 'Deoxyribonucleic Acid', 'Dual Nitrogen Atom', 'Dinitrogen Acetate'], correct: 1, exp: 'DNA = Deoxyribonucleic Acid — the molecule carrying genetic information.' },
      { q: 'What is the pH of a neutral substance?', opts: ['0', '5', '7', '14'], correct: 2, exp: 'pH 7 is neutral. Below 7 = acidic, above 7 = basic/alkaline.' },
      { q: 'Ohm\'s Law states:', opts: ['V = IR', 'P = IV', 'E = mc²', 'F = qE'], correct: 0, exp: 'V = IR: Voltage = Current × Resistance.' },
    ],
  },
  history: {
    elementary: [
      { q: 'Who was the first President of the United States?', opts: ['John Adams', 'Thomas Jefferson', 'George Washington', 'Benjamin Franklin'], correct: 2, exp: 'George Washington served as the 1st President from 1789 to 1797.' },
      { q: 'In what year did Christopher Columbus reach the Americas?', opts: ['1492', '1582', '1392', '1776'], correct: 0, exp: '"In 1492, Columbus sailed the ocean blue!" He reached the Caribbean that year.' },
      { q: 'What document begins "We the People"?', opts: ['Declaration of Independence', 'The Constitution', 'The Bill of Rights', 'The Emancipation Proclamation'], correct: 1, exp: 'The U.S. Constitution opens with "We the People of the United States..."' },
      { q: 'The American Civil War was fought over which major issue?', opts: ['Taxes on tea', 'Slavery', 'Land ownership', 'Trade with Britain'], correct: 1, exp: 'While there were multiple causes, slavery was the central issue of the Civil War (1861–1865).' },
      { q: 'Who wrote the Declaration of Independence?', opts: ['George Washington', 'Benjamin Franklin', 'John Adams', 'Thomas Jefferson'], correct: 3, exp: 'Thomas Jefferson was the primary author of the Declaration of Independence in 1776.' },
    ],
    middle: [
      { q: 'What triggered World War I?', opts: ['Assassination of Archduke Franz Ferdinand', 'Pearl Harbor attack', 'The Holocaust', 'D-Day invasion'], correct: 0, exp: 'The assassination of Archduke Franz Ferdinand in 1914 set off a chain of alliances, starting WWI.' },
      { q: 'Which empire built the Colosseum?', opts: ['Greek', 'Egyptian', 'Roman', 'Ottoman'], correct: 2, exp: 'The Roman Colosseum was built 70–80 AD and held up to 80,000 spectators.' },
      { q: 'The Civil Rights Act was signed in what year?', opts: ['1954', '1960', '1964', '1968'], correct: 2, exp: 'The Civil Rights Act of 1964 prohibited discrimination based on race, color, religion, or national origin.' },
      { q: 'The French Revolution began in:', opts: ['1776', '1789', '1812', '1848'], correct: 1, exp: 'The French Revolution began in 1789 with the storming of the Bastille.' },
      { q: 'Who was the leader of the Soviet Union during WWII?', opts: ['Lenin', 'Trotsky', 'Stalin', 'Khrushchev'], correct: 2, exp: 'Joseph Stalin led the USSR from 1924 to 1953, including all of World War II.' },
    ],
    high: [
      { q: 'What was the Marshall Plan?', opts: ['A military strategy in WWII', 'US aid to rebuild post-WWII Europe', 'A peace treaty with Japan', 'A nuclear weapons agreement'], correct: 1, exp: 'The Marshall Plan (1948) provided $13 billion in aid to rebuild Western European economies after WWII.' },
      { q: 'The Cold War was primarily between:', opts: ['US and China', 'US and USSR', 'UK and Germany', 'France and Russia'], correct: 1, exp: 'The Cold War (1947–1991) was an ideological conflict between the US (capitalism) and USSR (communism).' },
      { q: 'The Treaty of Versailles ended which war?', opts: ['World War II', 'The Korean War', 'World War I', 'The Vietnam War'], correct: 2, exp: 'The Treaty of Versailles (1919) officially ended World War I and imposed harsh terms on Germany.' },
      { q: 'Who led the Indian independence movement against British rule?', opts: ['Jawaharlal Nehru', 'Mahatma Gandhi', 'Subhas Chandra Bose', 'B.R. Ambedkar'], correct: 1, exp: 'Mahatma Gandhi led the nonviolent independence movement that resulted in India\'s independence in 1947.' },
      { q: 'The Berlin Wall fell in:', opts: ['1985', '1987', '1989', '1991'], correct: 2, exp: 'The Berlin Wall fell on November 9, 1989, symbolizing the end of the Cold War division of Germany.' },
    ],
  },
  english: {
    elementary: [
      { q: 'What is a noun?', opts: ['An action word', 'A describing word', 'A person, place, or thing', 'A connecting word'], correct: 2, exp: 'Nouns name people (teacher), places (school), things (book), or ideas (freedom).' },
      { q: 'Which word is spelled correctly?', opts: ['recieve', 'receive', 'receve', 'recieved'], correct: 1, exp: '"I before E except after C" — so it\'s re-CEI-ve.' },
      { q: 'What punctuation ends a question?', opts: ['Period (.)', 'Exclamation mark (!)', 'Comma (,)', 'Question mark (?)'], correct: 3, exp: 'Questions always end with a question mark (?). Example: "What time is it?"' },
      { q: 'What is the plural of "child"?', opts: ['Childs', 'Childes', 'Children', 'Childrens'], correct: 2, exp: '"Child" has an irregular plural — children. It does not follow the normal -s rule.' },
      { q: 'Which sentence is correct?', opts: ['Me and Jake went to the store.', 'Jake and I went to the store.', 'Jake and me went to the store.', 'I and Jake went to the store.'], correct: 1, exp: 'Remove the other person: "I went to the store" sounds right; "me went" does not. So: Jake and I.' },
    ],
    middle: [
      { q: 'A metaphor:', opts: ['Compares using "like" or "as"', 'Says one thing IS another', 'Exaggerates for effect', 'Gives human traits to objects'], correct: 1, exp: '"Life is a journey" is a metaphor (direct comparison). "Life is LIKE a journey" is a simile.' },
      { q: 'In "She ran quickly," "quickly" is a:', opts: ['Noun', 'Verb', 'Adjective', 'Adverb'], correct: 3, exp: 'Adverbs modify verbs — "quickly" describes HOW she ran.' },
      { q: 'What is the theme of a story?', opts: ["The main character's name", 'Where the story takes place', 'The central message or lesson', 'The order of events'], correct: 2, exp: 'Theme is the underlying message — like "friendship conquers adversity" or "honesty matters."' },
      { q: '"The wind whispered through the trees" is an example of:', opts: ['Simile', 'Alliteration', 'Personification', 'Hyperbole'], correct: 2, exp: 'Personification gives human qualities (whispering) to non-human things (wind).' },
      { q: 'What is a thesis statement?', opts: ['The conclusion of an essay', 'A question posed in the introduction', 'The main argument of an essay, usually in the intro', 'A supporting detail'], correct: 2, exp: 'A thesis statement presents the central argument. Every body paragraph supports it.' },
    ],
    high: [
      { q: '"Affect" vs "effect": which is usually a verb?', opts: ['"Effect"', '"Affect"', 'Both can be verbs', 'Neither'], correct: 1, exp: 'AFFECT (verb): "Music affects my mood." EFFECT (noun): "The effect was powerful." Remember: RAVEN — Remember Affect Verb Effect Noun.' },
      { q: 'A soliloquy is:', opts: ['A conversation between two characters', 'A character speaking thoughts aloud alone on stage', 'A song in a play', 'The final speech of a play'], correct: 1, exp: 'In a soliloquy, a character speaks their inner thoughts aloud. Famous example: Hamlet\'s "To be or not to be."' },
      { q: 'What is an unreliable narrator?', opts: ['A narrator who speaks too fast', 'A narrator whose account may be inaccurate or biased', 'A third-person narrator', 'A narrator who tells future events'], correct: 1, exp: 'An unreliable narrator\'s perspective is limited, biased, or deliberately deceptive. Example: Stevens in "The Remains of the Day."' },
      { q: 'Iambic pentameter has how many syllables per line?', opts: ['8', '10', '12', '14'], correct: 1, exp: '5 iambs (da-DUM) × 2 syllables each = 10 syllables per line. Shakespeare used it extensively.' },
      { q: '"All the world\'s a stage" is from which Shakespeare play?', opts: ['Hamlet', 'Macbeth', 'As You Like It', 'A Midsummer Night\'s Dream'], correct: 2, exp: 'This famous speech is from Act II, Scene VII of "As You Like It," spoken by Jacques.' },
    ],
  },
  geography: {
    elementary: [
      { q: 'How many continents are there?', opts: ['5', '6', '7', '8'], correct: 2, exp: '7 continents: Africa, Antarctica, Asia, Australia/Oceania, Europe, North America, South America.' },
      { q: 'What is the longest river in the world?', opts: ['Amazon', 'Mississippi', 'Nile', 'Yangtze'], correct: 2, exp: 'The Nile in Africa is approximately 4,130 miles (6,650 km) long.' },
      { q: 'What is the capital of the United States?', opts: ['New York City', 'Los Angeles', 'Chicago', 'Washington D.C.'], correct: 3, exp: 'Washington D.C. has been the US capital since 1800.' },
      { q: 'Which is the largest ocean?', opts: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3, exp: 'The Pacific Ocean covers about 165 million km² — larger than all land combined!' },
      { q: 'On which continent is the Sahara Desert?', opts: ['Asia', 'Australia', 'South America', 'Africa'], correct: 3, exp: 'The Sahara in northern Africa is the world\'s largest hot desert at ~9.2 million km².' },
    ],
    middle: [
      { q: 'Which country has the most freshwater?', opts: ['USA', 'Russia', 'Canada', 'Brazil'], correct: 3, exp: 'Brazil holds about 12% of the world\'s freshwater, mainly in the Amazon basin.' },
      { q: 'The Ring of Fire is:', opts: ['A volcanic zone around the Pacific Ocean', 'A fire weather band in California', 'A geological fault in Africa', 'The equatorial heat belt'], correct: 0, exp: 'The Ring of Fire is a major zone of volcanic activity and earthquakes around the Pacific Ocean edges.' },
      { q: 'Which mountain range separates Europe from Asia?', opts: ['Alps', 'Himalayas', 'Ural Mountains', 'Caucasus'], correct: 2, exp: 'The Ural Mountains in Russia form the traditional boundary between Europe and Asia.' },
      { q: 'What is the capital of Australia?', opts: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2, exp: 'Canberra is the capital. Sydney is the largest city but was not chosen to avoid rivalry with Melbourne.' },
      { q: 'The Amazon River flows through which country?', opts: ['Colombia', 'Peru', 'Brazil', 'Venezuela'], correct: 2, exp: 'About 60% of the Amazon flows through Brazil, though it also passes through Peru and Colombia.' },
    ],
    high: [
      { q: 'What causes the seasons on Earth?', opts: ["Earth's distance from the Sun", "Earth's axial tilt (23.5°)", 'Solar flare activity', 'The Moon\'s gravitational pull'], correct: 1, exp: "Earth's 23.5° axial tilt means different hemispheres receive more direct sunlight at different times of year." },
      { q: 'Mercator projection maps distort:', opts: ['The shape of continents near the equator', 'The size of landmasses near the poles', 'Ocean depths', 'Country borders'], correct: 1, exp: 'Mercator projections make Greenland look as large as Africa, but Africa is 14× larger. Polar regions are stretched.' },
      { q: 'Which tectonic plates form the Himalayan mountain range?', opts: ['Eurasian and African', 'Indian and Eurasian', 'Pacific and North American', 'Antarctic and South American'], correct: 1, exp: 'The Himalayas formed from the collision of the Indian Plate and the Eurasian Plate ~50 million years ago.' },
      { q: 'The Coriolis effect causes storms in the Northern Hemisphere to spin:', opts: ['Clockwise', 'Counterclockwise', 'In straight lines', 'Randomly'], correct: 1, exp: "The Coriolis effect from Earth's rotation deflects air to the right in the Northern Hemisphere, creating counterclockwise rotation." },
      { q: 'Which biome has the greatest biodiversity?', opts: ['Temperate deciduous forest', 'Tropical rainforest', 'Grassland', 'Tundra'], correct: 1, exp: 'Tropical rainforests hold over 50% of the world\'s species despite covering only ~6% of land area.' },
    ],
  },
};

const SUBJECT_LABELS: { key: Subject; label: string }[] = [
  { key: 'math', label: 'Math' },
  { key: 'science', label: 'Science' },
  { key: 'history', label: 'History' },
  { key: 'english', label: 'English' },
  { key: 'geography', label: 'Geography' },
];

const LEVEL_LABELS: { key: Level; label: string }[] = [
  { key: 'elementary', label: 'Elementary (K–5)' },
  { key: 'middle', label: 'Middle School (6–8)' },
  { key: 'high', label: 'High School (9–12)' },
];

interface Props { onBack: () => void; }

export default function K12EducationalGames({ onBack }: Props) {
  const [subject, setSubject] = useState<Subject>('math');
  const [level, setLevel] = useState<Level>('middle');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showExp, setShowExp] = useState(false);

  const pool = QUESTIONS[subject][level];
  const question = pool[index % pool.length];

  const handleSubject = (s: Subject) => { setSubject(s); resetQuestion(); };
  const handleLevel = (l: Level) => { setLevel(l); resetQuestion(); };

  const resetQuestion = () => {
    setIndex(0);
    setSelected(null);
    setShowExp(false);
    setScore(0);
    setTotal(0);
  };

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    setShowExp(true);
    setTotal(t => t + 1);
    if (i === question.correct) setScore(s => s + 1);
  };

  const next = () => {
    setIndex(i => i + 1);
    setSelected(null);
    setShowExp(false);
  };

  return (
    <div className="col-span-3 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors">
          &larr; Back
        </button>
        <span className="text-white font-semibold text-sm">Educational Games — Quiz Mode</span>
        {total > 0 && (
          <span className={`ml-auto text-sm font-bold ${score / total >= 0.7 ? 'text-green-400' : 'text-yellow-400'}`}>
            Score: {score} / {total}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {SUBJECT_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleSubject(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              subject === key ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {LEVEL_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleLevel(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              level === key ? 'bg-purple-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl p-5 flex-1">
        <p className="text-white font-semibold text-base mb-5">{question.q}</p>

        <div className="grid grid-cols-1 gap-2 mb-4">
          {question.opts.map((opt, i) => {
            let cls = 'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors border ';
            if (selected === null) {
              cls += 'bg-slate-700 text-gray-200 border-slate-600 hover:bg-slate-600 hover:border-slate-500 cursor-pointer';
            } else if (i === question.correct) {
              cls += 'bg-green-700/40 text-green-200 border-green-500 cursor-default';
            } else if (i === selected) {
              cls += 'bg-red-700/40 text-red-200 border-red-500 cursor-default';
            } else {
              cls += 'bg-slate-700/50 text-gray-500 border-slate-700 cursor-default';
            }
            return (
              <button key={i} className={cls} onClick={() => choose(i)} disabled={selected !== null}>
                <span className="mr-2 font-bold">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {showExp && (
          <div className={`rounded-lg px-4 py-3 text-sm mb-4 ${selected === question.correct ? 'bg-green-900/40 text-green-200' : 'bg-red-900/40 text-red-200'}`}>
            <span className="font-semibold mr-1">{selected === question.correct ? 'Correct!' : 'Not quite.'}</span>
            {question.exp}
          </div>
        )}

        {selected !== null && (
          <Button onClick={next} size="sm" className="bg-blue-600 hover:bg-blue-700">
            Next Question &rarr;
          </Button>
        )}
      </div>
    </div>
  );
}
