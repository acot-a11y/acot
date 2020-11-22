import React from 'react';

const Demo = () => <p>THIS COMPONENT IS EXCLUDE FROM ACOT AUDIT.</p>;

export default {
  title: 'exclude/Demo',
  component: Demo,
};

export const overview = () => <Demo />;

export const withTest = () => <Demo />;
