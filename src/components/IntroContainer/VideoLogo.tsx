import React from 'react';
import styled from 'styled-components';

export default function VideoLogo() {
    const Wrapper = styled.div`

  fadeIn: {
    visibility: "visible",
    opacity: 1,
    transition: "opacity 2s linear",
  }

  responsive: {
    width: '100%',
    maxwidth: '75px',
    height: 'auto',
  }
  `;

    const imgUrl = process.env.PUBLIC_URL + '/coffeeBreak.png';
    return <img id="2" width="100" src={imgUrl}></img>;
}
