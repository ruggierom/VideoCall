import React from 'react';
export default function VideoLogo() {
  const imgUrl = process.env.PUBLIC_URL + '/coffeeBreak.png';
  return <img id="2" width="75" src={imgUrl}></img>;
}
