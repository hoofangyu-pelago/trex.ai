import { View, styled } from 'tamagui';

export const Card = styled(View, {
  name: 'Card',
  backgroundColor: '$surface',
  borderColor: '$border',
  borderWidth: 1,
  borderRadius: 12,
  padding: '$5',
  shadowColor: 'rgba(0,0,0,0.3)',
  shadowOpacity: 1,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
});

