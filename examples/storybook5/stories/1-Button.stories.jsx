import React from 'react';
import { action } from '@storybook/addon-actions';
import { Button } from '@storybook/react/demo';

export default {
  title: 'Button',
  component: Button,
};

export const withValidButton = () => (
  <Button onClick={action('clicked')}>This is button</Button>
);

export const withInvalidButton = () => (
  <Button onClick={action('clicked')}></Button>
);
