export function detectEmotion(text) {
  const lower = text.toLowerCase();
  
  const emotions = {
    fear: /scared|afraid|nervous|anxious|worry|fear|lose money|risky|dangerous|panic/i,
    confused: /confused|don't understand|what is|explain|help|how does|why does/i,
    excited: /excited|amazing|great|wow|should i buy|invest now|hot|fomo|moon|rocket/i,
    insecure: /poor|can't afford|no money|broke|not enough|too expensive|small amount/i,
    curious: /learn|teach|curious|interested|want to know|tell me about|educate/i,
    urgent: /now|today|immediate|quickly|asap|right now|urgent/i
  };

  for (const [emotion, pattern] of Object.entries(emotions)) {
    if (pattern.test(text)) {
      return emotion;
    }
  }
  
  return 'neutral';
}

export function getEmotionContext(emotion) {
  const contexts = {
    fear: "The user seems worried or anxious. Be extra reassuring and calm. Use safety-focused metaphors.",
    confused: "The user needs clarification. Break things down step-by-step with simple examples.",
    excited: "The user is excited but might act impulsively. Gently encourage thoughtful analysis.",
    insecure: "The user feels they lack resources. Emphasize that small starts are valid and powerful.",
    curious: "The user is eager to learn. Provide educational content with actionable insights.",
    urgent: "The user wants quick answers. Be concise but remind them investing isn't about speed.",
    neutral: "General conversation. Maintain friendly, educational tone."
  };
  
  return contexts[emotion] || contexts.neutral;
}