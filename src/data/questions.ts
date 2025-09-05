import { Question, AgeGroup } from '../types';

export const QUESTIONS_BY_AGE: Record<AgeGroup, Question[]> = {
  "3-5": [
    {
      id: "3-5-1",
      text: "What do you like to do on the tablet or phone?",
      ageGroup: "3-5",
      category: "usage_patterns"
    },
    {
      id: "3-5-2", 
      text: "Do you play games with mommy and daddy or by yourself?",
      ageGroup: "3-5",
      category: "social_context"
    },
    {
      id: "3-5-3",
      text: "How do you feel when you can't use the tablet?",
      ageGroup: "3-5",
      category: "emotional_response"
    },
    {
      id: "3-5-4",
      text: "What games or shows do you like best?",
      ageGroup: "3-5",
      category: "content_preference"
    },
    {
      id: "3-5-5",
      text: "Do you ask for the tablet when you're sad or bored?",
      ageGroup: "3-5",
      category: "triggers"
    },
    {
      id: "3-5-6",
      text: "What do you do when you're not using the tablet?",
      ageGroup: "3-5",
      category: "alternative_activities"
    },
    {
      id: "3-5-7",
      text: "Do mommy and daddy use their phones a lot?",
      ageGroup: "3-5",
      category: "family_modeling"
    },
    {
      id: "3-5-8",
      text: "How long do you play before someone tells you to stop?",
      ageGroup: "3-5",
      category: "time_awareness"
    },
    {
      id: "3-5-9",
      text: "Do you have friends to play with at home?",
      ageGroup: "3-5",
      category: "social_environment"
    },
    {
      id: "3-5-10",
      text: "What makes you happy when you're not using screens?",
      ageGroup: "3-5",
      category: "intrinsic_motivation"
    }
  ],
  
  "6-8": [
    {
      id: "6-8-1",
      text: "What games or apps do you use most on your device?",
      ageGroup: "6-8",
      category: "usage_patterns"
    },
    {
      id: "6-8-2",
      text: "Do you play online with friends or alone?",
      ageGroup: "6-8",
      category: "social_context"
    },
    {
      id: "6-8-3",
      text: "How do you feel when your parents take away your device?",
      ageGroup: "6-8",
      category: "emotional_response"
    },
    {
      id: "6-8-4",
      text: "Do you watch videos or play games more?",
      ageGroup: "6-8",
      category: "content_preference"
    },
    {
      id: "6-8-5",
      text: "When do you want to use your device the most?",
      ageGroup: "6-8",
      category: "triggers"
    },
    {
      id: "6-8-6",
      text: "What activities do you enjoy that don't involve screens?",
      ageGroup: "6-8",
      category: "alternative_activities"
    },
    {
      id: "6-8-7",
      text: "Do your friends talk about games and apps at school?",
      ageGroup: "6-8",
      category: "peer_influence"
    },
    {
      id: "6-8-8",
      text: "How much time do you think you spend on devices each day?",
      ageGroup: "6-8",
      category: "time_awareness"
    },
    {
      id: "6-8-9",
      text: "Do you feel left out when you can't play games your friends play?",
      ageGroup: "6-8",
      category: "social_pressure"
    },
    {
      id: "6-8-10",
      text: "What do you do when you feel upset or worried?",
      ageGroup: "6-8",
      category: "coping_mechanisms"
    }
  ],

  "9-12": [
    {
      id: "9-12-1",
      text: "What platforms or apps do you spend the most time on?",
      ageGroup: "9-12",
      category: "usage_patterns"
    },
    {
      id: "9-12-2",
      text: "Do you feel you need to be online to stay connected with friends?",
      ageGroup: "9-12",
      category: "social_context"
    },
    {
      id: "9-12-3",
      text: "How do you react when you can't access your devices?",
      ageGroup: "9-12",
      category: "emotional_response"
    },
    {
      id: "9-12-4",
      text: "What draws you most to gaming or social media?",
      ageGroup: "9-12",
      category: "content_preference"
    },
    {
      id: "9-12-5",
      text: "In what situations do you find yourself reaching for your device?",
      ageGroup: "9-12",
      category: "triggers"
    },
    {
      id: "9-12-6",
      text: "What hobbies or activities interest you outside of technology?",
      ageGroup: "9-12",
      category: "alternative_activities"
    },
    {
      id: "9-12-7",
      text: "How important is it to you to have the same games/apps as your friends?",
      ageGroup: "9-12",
      category: "peer_influence"
    },
    {
      id: "9-12-8",
      text: "Do you ever lose track of time when using devices?",
      ageGroup: "9-12",
      category: "time_awareness"
    },
    {
      id: "9-12-9",
      text: "How does using technology make you feel about yourself?",
      ageGroup: "9-12",
      category: "self_esteem"
    },
    {
      id: "9-12-10",
      text: "What challenges or stress in your life might lead you to use devices more?",
      ageGroup: "9-12",
      category: "coping_mechanisms"
    }
  ]
};

export const getQuestionsForAge = (ageGroup: AgeGroup): Question[] => {
  return QUESTIONS_BY_AGE[ageGroup] || [];
};