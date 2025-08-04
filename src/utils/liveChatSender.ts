export const sendLiveChatMessage = async (message: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/youtube/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Message sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending live chat message:', error);
    return false;
  }
};

export const sendEndStudyMessage = async (userName: string): Promise<boolean> => {
  const messages = [
    `${userName}さん、お疲れさまでした！勉強時間が記録されました。`,
    `${userName}さん、今日もお疲れさまでした！`,
    `${userName}さん、勉強お疲れさま！記録完了です。`,
    `${userName}さん、お疲れさまでした！今日も頑張りましたね。`,
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  return await sendLiveChatMessage(randomMessage);
};