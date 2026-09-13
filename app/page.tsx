"use client";

import {
  Center,
  Grid,
  Title,
  Image,
  Button,
  Space,
  Radio,
  Group,
  Modal,
  TextInput,
  Stack,
  Text,
} from "@mantine/core";
import TextCard from "./components/FlashCard/TextCard";
import { Phrase, phraseList } from "./components/Phrases";
import { useEffect, useMemo, useState } from "react";
import ImageCard from "./components/FlashCard/ImageCard";

const difficultyMap: { [key: string]: number } = {
  easy: 6,
  medium: 8,
  hard: 10,
  endless: 10,
};

const PLAYER_NAME_KEY = "playerName";

// Helper function for generating random numbers
const randomNumberInRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function for setting the list of phrases that were selected
// It should run this function once upon initial loadup of the page
// TODO: change for loop based on number of cards someone wants
function choosePhrases(cardsAmt: number): Phrase[] {
  let phraseListClone = [...phraseList];
  let selectedPhrases: Phrase[] = [];
  for (let i = 0; i < cardsAmt; i += 2) {
    let ind = randomNumberInRange(0, phraseListClone.length - 1);
    let startOfPair = ind % 2 === 0 ? ind : ind - 1;
    selectedPhrases.push(phraseListClone[startOfPair]);
    selectedPhrases.push(phraseListClone[startOfPair + 1]);
    phraseListClone.splice(startOfPair, 2);
  }
  return selectedPhrases;
}

// Function to replace the chosen phrase in a list with a random new one not currently in the list
function replacePhrase(
  phrases: Phrase[],
  phraseId: number,
): { phrases: Phrase[]; newPhrase: Phrase } {
  let newId = phrases[0].id;
  let ind = 0;
  // As long as we keep finding something in our list, reroll
  while (phrases.findIndex((phrase) => phrase.id == newId) != -1) {
    ind = randomNumberInRange(0, phraseList.length - 1);
    newId = phraseList[ind].id;
  }
  const newPhrase = phraseList[ind];
  const replaceInd = phrases.findIndex((phrase) => phrase.id == phraseId);
  const updatedPhrases = [...phrases];
  updatedPhrases[replaceInd] = newPhrase;
  return { phrases: updatedPhrases, newPhrase };
}

/* Randomize array not-in-place using Durstenfeld shuffle algorithm */
function shuffleArray<T>(array: T[]) {
  let ret = array.slice(0);
  for (var i = ret.length - 1; i >= 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = ret[i];
    ret[i] = ret[j];
    ret[j] = temp;
  }
  return ret;
}

export default function HomePage() {
  // Checking if we're on the client or server
  const [isClient, setIsClient] = useState(false);

  // Scoring, streak, and lives for Endless mode
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);

  // Use state to track the chosen phrases, since we reshuffle them
  // Also track difficulty
  const [difficulty, setDifficulty] = useState("easy");
  const [chosenPhrases, setChosenPhrases] = useState(
    choosePhrases(difficultyMap[difficulty]),
  );

  // --- Player name (saved to localStorage) ---
  const [playerName, setPlayerName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [nameModalOpen, setNameModalOpen] = useState(false);

  // --- Win screen ---
  const [gameWonOpen, setGameWonOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Load saved name, or prompt for one if none exists yet
    const savedName = window.localStorage.getItem(PLAYER_NAME_KEY);
    if (savedName) {
      setPlayerName(savedName);
    } else {
      setNameModalOpen(true);
    }
  }, []);

  const saveName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    window.localStorage.setItem(PLAYER_NAME_KEY, trimmed);
    setPlayerName(trimmed);
    setNameModalOpen(false);
  };

  // Used for card colors. If there's a correct match, let the game know
  const [isCorrectMatch, setIsCorrectMatch] = useState<boolean | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Helper function to properly calculate the card color
  function calcColor(selectorState: number, cardId: number): string {
    if (selectorState === cardId) {
      if (isEvaluating && isCorrectMatch) {
        return "green";
      } else if (isEvaluating && !isCorrectMatch) {
        return "red";
      } else {
        return "blue";
      }
    } else {
      return "white";
    }
  }

  // Shuffle the phrases and images so pairs don't appear next to each other, and images don't match their phrases
  // Use memo to ensure this only happens when our array actually changes
  const [txtOrder, setTxtOrder] = useState<Phrase[]>(() =>
    shuffleArray(chosenPhrases),
  );
  const [imgOrder, setImgOrder] = useState<Phrase[]>(() =>
    shuffleArray(chosenPhrases),
  );

  // Map each element in the chosen phrases array to a text card
  // Use state to keep track of which button is selected
  const [selectedTxtButton, setTxtButton] = useState(-1);
  // Use state to keep track of which audio is playing
  const textCards = txtOrder.map((phrase) => {
    let cardText: string = isClient
      ? phrase.object + phrase.particle + phrase.kanji
      : "ローディング中";
    return (
      <TextCard
        key={phrase.id}
        text={cardText}
        onSelect={() => (isEvaluating ? "" : setTxtButton(phrase.id))}
        color={calcColor(selectedTxtButton, phrase.id)}
        audio={phrase.audioURL}
      ></TextCard>
    );
  });

  const textCardsLeft = textCards.filter((_, i) => i % 2 === 0);
  const textCardsRight = textCards.filter((_, i) => i % 2 === 1);

  // Map each element in the chosen phrases array to an image card
  // Use state to keep track of which button is selected
  const [selectedImgButton, setImgButton] = useState(-1);
  const imgCards = imgOrder.map((phrase) => {
    return (
      <ImageCard
        key={phrase.id}
        image={isClient ? phrase.imageURL : undefined}
        onSelect={() => (isEvaluating ? "" : setImgButton(phrase.id))}
        color={calcColor(selectedImgButton, phrase.id)}
      ></ImageCard>
    );
  });

  // Matching function
  const checkMatch = () => {
    if (lives == 0) return;
    setIsEvaluating(true);

    const wasCorrect = selectedTxtButton == selectedImgButton;
    const matchedId = selectedTxtButton;

    if (wasCorrect) {
      setIsCorrectMatch(true);
      setStreak(streak + 1);
      setScore(score + 1000 * (streak + 1));
    } else {
      setIsCorrectMatch(false);
      setStreak(0);
      setLives(lives - 1);
    }

    setTimeout(() => {
      if (wasCorrect) {
        if (difficulty === "endless") {
          const { phrases: updatedPhrases, newPhrase } = replacePhrase(
            chosenPhrases,
            matchedId,
          );
          setChosenPhrases(updatedPhrases);
          setTxtOrder((prev) =>
            prev.map((phrase) =>
              phrase.id === matchedId ? newPhrase : phrase,
            ),
          );
          setImgOrder((prev) =>
            prev.map((phrase) =>
              phrase.id === matchedId ? newPhrase : phrase,
            ),
          );
        } else {
          const remaining = chosenPhrases.filter(
            (phrase) => phrase.id !== matchedId,
          );
          setChosenPhrases(remaining);
          setTxtOrder((prev) =>
            prev.filter((phrase) => phrase.id !== matchedId),
          );
          setImgOrder((prev) =>
            prev.filter((phrase) => phrase.id !== matchedId),
          );

          // If that was the last pair, the player has won!
          if (remaining.length === 0) {
            setGameWonOpen(true);
          }
        }
      }
      setTxtButton(-1);
      setImgButton(-1);
      setIsEvaluating(false);
    }, 3000);
  };

  const imgCardsLeft = imgCards.filter((_, i) => i % 2 === 0);
  const imgCardsRight = imgCards.filter((_, i) => i % 2 === 1);

  const startNewGame = () => {
    const newPhrases = choosePhrases(difficultyMap[difficulty]);
    setChosenPhrases(newPhrases);
    setTxtOrder(shuffleArray(newPhrases));
    setImgOrder(shuffleArray(newPhrases));
    setScore(0);
    setStreak(0);
    setLives(3);
    setGameWonOpen(false);
  };

  let titleBar;

  if (difficulty === "endless") {
    titleBar = (
      <Title order={1}>
        日本語のマッチングゲーム {"Score: " + score} {" Streak: " + streak}{" "}
        {"Lives: " + lives}
      </Title>
    );
    if (lives === 0) {
      titleBar = (
        <Title order={1}>
          日本語のマッチングゲーム {"Score: " + score} {" Streak: " + streak}{" "}
          {"Lives: " + lives + ' Nice job! Press "Generate" to go again!'}
        </Title>
      );
    }
  } else {
    titleBar = (
      <Title order={1}>
        日本語のマッチングゲーム {"Score: " + score} {" Streak: " + streak}
      </Title>
    );
  }

  return (
    <>
      {/* Name entry modal — shown once, on first visit */}
      <Modal
        opened={nameModalOpen}
        onClose={() => {}}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        title="Welcome!"
      >
        <Stack>
          <Text>What's your name?</Text>
          <TextInput
            placeholder="Enter your name"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveName(nameDraft);
            }}
            data-autofocus
          />
          <Button
            onClick={() => saveName(nameDraft)}
            disabled={!nameDraft.trim()}
          >
            Save
          </Button>
        </Stack>
      </Modal>

      {/* "You Won" modal */}
      <Modal
        opened={gameWonOpen}
        onClose={() => setGameWonOpen(false)}
        title="おめでとうございます！"
        centered
      >
        <Stack>
          <Text size="lg">
            {playerName
              ? `Congratulations, ${playerName}!`
              : "Congratulations!"}
          </Text>
          <Text>Final Score: {score}</Text>
          <Text>Best Streak: {streak}</Text>
          <Button onClick={startNewGame}>Play Again</Button>
        </Stack>
      </Modal>

      <Center>{titleBar}</Center>
      {playerName && (
        <Center>
          <Text c="dimmed" size="sm">
            Playing as {playerName}
          </Text>
        </Center>
      )}
      <Grid>
        <Grid.Col span={4}>
          <Center>
            <Radio.Group
              name="difficulty"
              label="Select your difficulty!"
              value={difficulty}
              onChange={setDifficulty}
            >
              <Group mt="xs">
                <Radio value="easy" label="Easy" />
                <Radio value="medium" label="Medium" />
                <Radio value="hard" label="Hard" />
                <Radio value="endless" label="Endless" />
              </Group>
            </Radio.Group>
          </Center>
        </Grid.Col>
        <Grid.Col span={4}>
          <Center>
            <Button
              onClick={() => checkMatch()}
              disabled={
                selectedImgButton == -1 ||
                selectedTxtButton == -1 ||
                isEvaluating
              }
            >
              Evaluate
            </Button>
          </Center>
        </Grid.Col>
        <Grid.Col span={4}>
          <Center>
            <Button onClick={startNewGame}>Generate</Button>
          </Center>
        </Grid.Col>
      </Grid>
      <Grid>
        {/* Words Half */}
        <Grid.Col span={6}>
          <Center>
            <Title order={1}>動詞</Title>
          </Center>
          {/* Grid which changes how many columns there are depending on
          screen size */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>{textCardsLeft}</Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>{textCardsRight}</Grid.Col>
          </Grid>
        </Grid.Col>
        {/* Pictures Half */}
        <Grid.Col span={6}>
          <Center>
            <Title order={1}>写真</Title>
          </Center>
          {/* Grid which changes how many columns there are depending on
          screen size */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>{imgCardsLeft}</Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>{imgCardsRight}</Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
      <Space h="xl" />

      {/* Tutorial / How to Play */}
      <Center>
        <Stack maw={600} gap="xs" p="md">
          <Title order={3} ta="center">
            How to Play
          </Title>
          <Text>
            <b>Match:</b> Click a sentence on the left (動詞) and its matching
            picture on the right (写真), then press <b>Evaluate</b> to check if
            they go together.
          </Text>
          <Text>
            <b>Correct pairs</b> turn green and disappear from the board (or get
            replaced in Endless mode). As you continue to get right answers,
            your streak increases!
          </Text>
          <Text>
            <b>Wrong guesses</b> turn red and reset your streak.
          </Text>
          <Text>
            <b>Generate:</b> This button effectively restarts the game.
          </Text>
          <Text>
            <b>Difficulty:</b> Easy, Medium, and Hard give you 6, 8, or 10
            sentences respectively. Endless will continue until you get three
            wrong answers.
          </Text>
        </Stack>
      </Center>
      {/* Credits */}
      <Center>
        <Stack maw={600} gap="xs" p="md">
          <Title order={3} ta="center">
            Credits
          </Title>
          <Text>
            <b>Project Director & Japanese Language Content</b>: Atsuko Suga
            Borgmann
          </Text>
          <Text>
            <b>Game Design & Programming</b>: Angel Arrazola and Ross Williams
          </Text>
          <Text>
            <b>Artist</b>: Phoebe Yao
          </Text>
          <Text>
            <i>
              This project was developed at Brown University with support from
              the UTRA.
            </i>
          </Text>
        </Stack>
      </Center>
    </>
  );
}
