import React from 'react';
import { Button } from '@storybook/react/demo';

export default {
  title: 'Button',
  component: Button,
};

export const withValidButton = () => <Button>This is button</Button>;

export const withInvalidButton = () => <Button></Button>;
