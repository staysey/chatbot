export const MOCK_BOT_MESSAGE = "this is mock data";
export const MOCK_RESPONSE_DELAY_MS = 2000;

export function getMockAiResponse() {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve({ botMessage: MOCK_BOT_MESSAGE }),
      MOCK_RESPONSE_DELAY_MS,
    );
  });
}
