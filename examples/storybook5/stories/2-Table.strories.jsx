import React from 'react';

export default {
  title: 'Table',
};

export const withValidTable = () => (
  <table>
    <thead>
      <tr>
        <th></th>
        <th>A</th>
        <th>B</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>C</th>
        <td>D</td>
        <td>E</td>
      </tr>
    </tbody>
  </table>
);

export const withInvalidTable = () => (
  <table style="display: block;">
    <thead>
      <tr>
        <th></th>
        <th>A</th>
        <th>B</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>C</th>
        <td>D</td>
        <td>E</td>
      </tr>
    </tbody>
  </table>
);
