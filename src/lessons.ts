/** Korean teaching copy for the fixed MVP curriculum. No assessment is timed. */
export interface ConceptQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Lesson {
  sceneName: string;
  eyebrow: string;
  concept: string;
  instruction: string;
  listenHint: string;
  practiceHint: string;
  resultHint: string;
  nextExercise: string;
  educationAssetId: string;
  quiz: ConceptQuestion;
}

export const EDUCATION_REVIEW_NOTICE = '개발 프리뷰 · 악보·청음·교육자 최종 검수 대기 중입니다. 학습 효과는 아직 검증하지 않았습니다.';

export interface MeterQuizQuestion extends ConceptQuestion {
  id: string;
  /** Use for an anonymous two-bar demonstration; revealLabel follows the answer. */
  levelId: 'L06' | 'L07';
  revealLabel: string;
  repeats: 2;
}

export const METER_QUIZ_REQUIRED_CORRECT = 3 as const;

/** The initial question order is fixed by design §9.4 / promptpack P13. */
export const METER_QUIZ: readonly MeterQuizQuestion[] = [
  {
    id: 'Q1', levelId: 'L06', repeats: 2,
    question: 'A의 소리나 시각 묶음을 두 마디 살펴보세요. 여섯 작은 움직임이 어떻게 묶였나요?',
    options: ['둘씩 세 묶음', '셋씩 두 묶음'], answer: 0,
    explanation: '둘씩 세 묶음이에요. 3/4에서는 4분음표 큰박 세 개에 8분음표가 둘씩 들어가요.',
    revealLabel: '3/4 · 둘씩 세 묶음 · 4분음표=90',
  },
  {
    id: 'Q2', levelId: 'L07', repeats: 2,
    question: 'B의 소리나 시각 묶음을 두 마디 살펴보세요. 여섯 작은 움직임이 어떻게 묶였나요?',
    options: ['둘씩 세 묶음', '셋씩 두 묶음'], answer: 1,
    explanation: '셋씩 두 묶음이에요. 이 6/8 수업에서는 점4분음표 큰박 두 개에 8분음표가 셋씩 들어가요.',
    revealLabel: '6/8 · 셋씩 두 묶음 · 점4분음표=60',
  },
  {
    id: 'Q3', levelId: 'L07', repeats: 2,
    question: '새로운 A의 소리나 시각 묶음을 두 마디 살펴보세요. 어떤 묶음인가요?',
    options: ['둘씩 세 묶음', '셋씩 두 묶음'], answer: 1,
    explanation: '셋씩 두 묶음인 6/8이에요. 표시 이름이 바뀌어도 큰박 둘의 묶음은 같아요.',
    revealLabel: '6/8 · 셋씩 두 묶음 · 점4분음표=60',
  },
  {
    id: 'Q4', levelId: 'L06', repeats: 2,
    question: '새로운 B의 소리나 시각 묶음을 두 마디 살펴보세요. 어떤 묶음인가요?',
    options: ['둘씩 세 묶음', '셋씩 두 묶음'], answer: 0,
    explanation: '둘씩 세 묶음인 3/4예요. 작은 음 여섯 개의 수나 속도가 아니라 큰박의 묶음을 구별했어요.',
    revealLabel: '3/4 · 둘씩 세 묶음 · 4분음표=90',
  },
];

/**
 * Omit seed for the specified first sequence. Later attempts can persist a seed
 * and help mode together; each shuffle keeps its sound cue and answer together.
 */
export function createMeterQuiz(seed?: number): MeterQuizQuestion[] {
  const questions = METER_QUIZ.map(question => ({ ...question, options: [...question.options] }));
  if (seed === undefined) return questions;
  if (!Number.isFinite(seed)) throw new RangeError('Meter quiz seed must be finite');
  let state = Math.trunc(seed) >>> 0;
  const random = (): number => {
    state = (state + 0x6D2B79F5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ mixed >>> 15, mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ mixed >>> 7, mixed | 61);
    return ((mixed ^ mixed >>> 14) >>> 0) / 0x100000000;
  };
  for (let index = questions.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [questions[index], questions[other]] = [questions[other]!, questions[index]!];
  }
  return questions;
}

/** IDs match Level.id; ordering is supplied by the recommended curriculum. */
export const LESSONS: Record<string, Lesson> = {
  L01: {
    sceneName: '실빛다리', eyebrow: '첫 번째 매듭 · 음표의 길이',
    concept: '이 수업의 4/4에서는 4분음표가 한 박이에요. 2분음표는 그 두 배 길이예요.',
    instruction: '실의 닫힌 시작 원에서 누르고, 빈 끝 원에서 놓아요. 짧은 실 뒤에는 쉬고, 긴 실을 이어요.',
    listenHint: '솜새가 짧은 실과 긴 실을 두 번 보여 줘요. 소리의 시작과 끝을 들어 보세요.',
    practiceHint: '첫 실은 한 박, 다음 긴 실은 두 박 동안 눌러요. 빈 원에서 놓은 뒤 다음 시작을 기다려요.',
    resultHint: '길게 누르는 연습은 소리를 유지할 시간을 익히는 방법이에요. 실제 악기마다 소리를 잇는 동작은 달라요.',
    nextExercise: '다음에는 같은 높이의 음표 두 개를 하나의 소리로 이어 보세요.',
    educationAssetId: 'education_duration',
    quiz: {
      question: '같은 빠르기에서 2분음표의 길이는 4분음표의 몇 배일까요?',
      options: ['두 배', '같은 길이', '절반'], answer: 0,
      explanation: '2분음표 하나는 4분음표 두 개를 합한 길이예요. 빠르기가 바뀌어도 이 길이 비율은 같아요.',
    },
  },
  L02: {
    sceneName: '실빛다리', eyebrow: '두 번째 매듭 · 붙임줄',
    concept: '붙임줄은 같은 높이의 이웃한 음표를 하나의 소리로 이어요. 소리의 시작은 한 번이에요.',
    instruction: '같은 음을 이은 중간 매듭에서는 계속 누르고 있어요. 끝의 빈 원에서 한 번 놓아요.',
    listenHint: '두 4분음표를 잇는 동안 소리가 다시 시작하지 않는지 들어 보세요. 뒤의 짧은 음은 따로 시작해요.',
    practiceHint: '첫 C5에서 한 번 눌러 두 박 동안 유지해요. 중간 매듭에서는 다시 누르지 않아요. 쉰 뒤의 E5는 가볍게 탭해요.',
    resultHint: '4분음표 두 개의 붙임줄은 2분음표와 같은 길이예요. 붙임줄 뒤의 E5는 별개의 음이에요.',
    nextExercise: '다음에는 마디선을 넘어도 붙임줄의 소리를 이어 보세요.',
    educationAssetId: 'education_tie',
    quiz: {
      question: '같은 높이의 4분음표 두 개를 연주할 때, 소리의 시작이 한 번인 것은 무엇일까요?',
      options: ['붙임줄 없이 나란히 쓴 두 음표', '붙임줄로 이은 두 음표'], answer: 1,
      explanation: '붙임줄로 이으면 첫 음에서만 시작하고 두 음표의 길이를 합해 유지해요. 붙임줄 없는 두 음은 각각 시작해요.',
    },
  },
  L03: {
    sceneName: '실빛다리', eyebrow: '세 번째 매듭 · 마디선을 넘는 붙임줄',
    concept: '마디선은 시간을 나누는 표시예요. 같은 음의 붙임줄이 이어지면 마디선에서도 소리를 끊지 않아요.',
    instruction: '기다린 뒤 실을 잡고, 마디의 기둥을 지나도 계속 이어요. 빈 끝 원에서 놓아요.',
    listenHint: '첫 마디의 마지막 C5가 다음 마디의 C5로 이어져요. 기둥을 지날 때 새 소리가 나는지 들어 보세요.',
    practiceHint: '첫 세 박을 쉰 뒤 눌러요. 다음 마디까지 세 박 길이로 유지하고 놓아요. 쉰 뒤 E5는 한 박 동안 따로 눌러요.',
    resultHint: '실제 두 마디 악보에서 4분 C5와 2분 C5가 이어져요. 별도 붙임줄 설명 그림은 개념을 보여 주는 부분 발췌이며, 두 마디 전체를 나타내지 않아요.',
    nextExercise: '꽃잎 수업에서 원래 길이에 절반을 더하는 점을 알아보세요.',
    educationAssetId: 'education_tie',
    quiz: {
      question: '붙임줄로 이은 같은 음이 마디선을 지나갈 때 어떻게 할까요?',
      options: ['마디선에서 놓고 다시 누르기', '소리를 끊지 않고 끝까지 유지하기'], answer: 1,
      explanation: '마디선에서도 붙임줄은 이어져요. 두 음표의 길이를 합하고, 중간에는 새 소리를 시작하지 않아요.',
    },
  },
  L04: {
    sceneName: '반달 온실', eyebrow: '네 번째 매듭 · 점음표',
    concept: '점 하나는 원래 길이의 절반을 더해요. 점4분음표는 두 작은 칸에 한 칸을 더한 세 칸이에요.',
    instruction: '두 칸 길이에 그 절반인 한 칸을 더해요. 세 칸 동안 누르고 빈 원에서 놓아요.',
    listenHint: '점4분음표의 세 작은 칸과 뒤의 짧은 쉼을 들어 보세요. 점에서 소리를 다시 시작하지 않아요.',
    practiceHint: '같은 폭의 세 칸 동안 물을 주고, 다음 한 칸은 쉬어요. 점 때문에 늘어난 마지막 칸까지 유지해요.',
    resultHint: '점은 원래 길이의 절반을 더해요. 4분음표에 붙은 점과 2분음표에 붙은 점이 더하는 길이는 서로 달라요.',
    nextExercise: '접히는 방에서 같은 여섯 작은 움직임을 다르게 묶어 보세요.',
    educationAssetId: 'education_dot',
    quiz: {
      question: '2분음표에 점 하나를 붙이면 어떤 길이를 더할까요?',
      options: ['8분음표 길이', '4분음표 길이', '언제나 반 박'], answer: 1,
      explanation: '2분음표의 절반인 4분음표 길이를 더해요. 4분음표에 붙은 점은 그 절반인 8분음표 길이를 더해요.',
    },
  },
  L05: {
    sceneName: '반달 온실', eyebrow: '일곱 번째 매듭 · 점쉼표',
    concept: '쉼표는 내가 맡은 소리를 쉬는 시간이에요. 이 6/8 수업에서 점4분쉼표는 큰박 하나의 길이예요.',
    instruction: '꽃이 닫힌 큰박 하나 동안 기다리고, 다음 세 이슬부터 가볍게 눌러요.',
    listenHint: '내 꽃의 소리가 쉬어도 작은 박과 반주는 계속 가요. 쉼 뒤 첫 소리가 오는 곳을 들어 보세요.',
    practiceHint: '작은 세 칸을 기다린 뒤 세 번 탭해요. 다음 마디에서는 세 칸 동안 누르고, 남은 세 칸은 쉬어요.',
    resultHint: '쉼의 깨끗함과 쉰 뒤 다시 들어온 시작을 따로 확인해요. 기다리는 것만으로 리듬 점수를 더하지 않아요.',
    nextExercise: '구름 우체역에서 음과 쉼이 같은 순서로 오는 편지를 받아 보세요.',
    educationAssetId: 'education_dotted_rest',
    quiz: {
      question: '점쉼표가 나오는 동안 무엇을 쉬어야 할까요?',
      options: ['모든 음악과 시간의 흐름', '내가 맡은 꽃의 소리'], answer: 1,
      explanation: '내가 맡은 성부의 소리를 쉬어요. 반주와 박 단서는 계속될 수 있어요. 이 수업의 점4분쉼표는 작은 세 칸이에요.',
    },
  },
  L06: {
    sceneName: '접히는 방', eyebrow: '다섯 번째 매듭 · 둘씩 세 묶음',
    concept: '같은 여섯 8분음표를 둘씩 세 묶음으로 느껴요. 3/4의 큰박은 4분음표 세 개예요.',
    instruction: '여섯 작은 타일에서 한 번씩 탭해요. 방은 둘씩 세 번 접혀요.',
    listenHint: '작은 움직임 여섯 개 사이에서 큰 접힘 세 번을 찾아보세요. 표시 빠르기는 4분음표=90이에요.',
    practiceHint: '도움 숫자 1 & 2 & 3 &를 따라 여섯 번 탭해요. 세게 누르는 힘은 채점하지 않아요.',
    resultHint: '여섯 탭의 정확도와 묶음을 고르는 개념 문제는 별개예요. 개념 문제는 시간 제한 없이 다시 듣거나 시각 묶음으로 확인할 수 있어요.',
    nextExercise: '같은 여섯 8분음표를 셋씩 두 묶음으로 바꾸어 들어 보세요.',
    educationAssetId: 'education_meter',
    quiz: {
      question: '이 수업에서 느낀 여섯 작은 움직임의 묶음은 무엇인가요?',
      options: ['둘씩 세 묶음', '셋씩 두 묶음'], answer: 0,
      explanation: '둘씩 세 묶음이면 3/4예요. 4분음표 큰박이 세 번 있고, 각 큰박에 8분음표 두 개가 들어가요.',
    },
  },
  L07: {
    sceneName: '접히는 방', eyebrow: '여섯 번째 매듭 · 셋씩 두 묶음',
    concept: '이번에는 같은 여섯 8분음표를 셋씩 두 묶음으로 느껴요. 이 6/8 수업에서는 점4분음표 큰박 둘로 느껴 봐요.',
    instruction: '여섯 타일에서 한 번씩 탭해요. 작은 움직임의 속도는 그대로이고, 방은 셋씩 두 번 접혀요.',
    listenHint: '큰 접힘 두 번을 들어 보세요. 점4분음표=60이며, 앞 수업의 4분음표=90과 작은 음의 간격은 같아요.',
    practiceHint: '도움 숫자 1 라 리 2 라 리를 따라 여섯 번 탭해요. 누르는 힘보다 묶음의 시작을 느껴 보세요.',
    resultHint: '탭 수는 여섯 번으로 같아요. 큰박의 묶음과 강세가 달라져요. 시각 도움을 사용한 개념 결과는 청각만으로 푼 결과와 구별해 기록해요.',
    nextExercise: '온실로 돌아가 큰박 하나 길이의 점쉼표를 기다려 보세요.',
    educationAssetId: 'education_meter',
    quiz: {
      question: '이번 수업에서 느낀 여섯 작은 움직임의 묶음은 무엇인가요?',
      options: ['둘씩 세 묶음', '셋씩 두 묶음'], answer: 1,
      explanation: '셋씩 두 묶음이면 이 수업의 6/8이에요. 점4분음표 큰박마다 8분음표 세 개가 들어가요.',
    },
  },
  L08: {
    sceneName: '구름 우체역', eyebrow: '여덟 번째 매듭 · 빠르기',
    concept: '4분음표=72는 1분에 4분음표 길이의 박동이 72번이라는 뜻이에요. 마디 수를 뜻하지 않아요.',
    instruction: '같은 간격으로 오는 네 편지를 탭해요. 편지 사이의 짧은 쉼도 느껴 보세요.',
    listenHint: '음과 쉼이 번갈아 오는 순서를 들어 보세요. 다음 수업에서도 음표와 순서는 같아요.',
    practiceHint: '도착한 편지마다 가볍게 누르고 놓아요. 탭 뒤 손을 떼고 다음 편지를 기다려요.',
    resultHint: '이 패턴을 다음 수업과 비교할 때 기준 음표가 모두 4분음표인지 먼저 확인해요. 음표 길이의 비율과 실제 걸리는 시간을 구별해요.',
    nextExercise: '같은 편지 패턴을 4분음표=108에서 비교해 보세요.',
    educationAssetId: 'education_tempo',
    quiz: {
      question: '같은 패턴을 4분음표=72에서 108로 바꾸면 무엇이 달라질까요?',
      options: ['음표 종류가 자동으로 바뀌어요', '음가 비율은 같고 실제 시간이 짧아져요'], answer: 1,
      explanation: '기준 음표가 같을 때 숫자가 커지면 더 빨라져요. 같은 음표와 쉼표의 비율은 그대로예요.',
    },
  },
  L09: {
    sceneName: '구름 우체역', eyebrow: '아홉 번째 매듭 · 같은 모양, 다른 시간',
    concept: '같은 패턴의 4분음표 기준 빠르기가 72에서 108로 바뀌었어요. 리듬의 비율은 같고 흐르는 속도가 달라져요.',
    instruction: '새 빠르기의 한 마디 예고를 듣고 같은 네 편지를 받아요. 음표와 쉼표의 순서는 같아요.',
    listenHint: '앞 수업과 같은 모양이 더 짧은 시간에 흘러가요. 4분음표=108을 확인해 보세요.',
    practiceHint: '편지 도착마다 한 번 탭해요. 빨리 눌러도 다음 편지가 일찍 오지는 않아요. 필요하면 75% 연습을 선택할 수 있어요.',
    resultHint: '같은 한 마디는 72에서 약 3.33초, 108에서 약 2.22초예요. 108에서 걸리는 시간은 72의 2/3이며 음가의 비율은 같아요.',
    nextExercise: '꿈 지도에서 원하는 수업을 다시 골라 보세요. 높은 점수가 없어도 모든 수업을 연습할 수 있어요.',
    educationAssetId: 'education_tempo',
    quiz: {
      question: '같은 패턴을 4분음표=72에서 108로 연주하면 전체 시간은 원래의 얼마인가요?',
      options: ['3/2', '똑같아요', '2/3'], answer: 2,
      explanation: '같은 길이를 1.5배 빠르게 연주하므로 시간은 2/3이 돼요. 같은 8분음표와 쉼표를 그대로 사용해요.',
    },
  },
};
