import React from 'react';
import styled from 'styled-components';

export default function About() {
    const imgUrl = process.env.PUBLIC_URL + '/coffeeBreak.png';
    const Wrapper = styled.div`
    min-height: calc(100vh - 50px);
    background-color: #f76565;
    padding: 20px;

    span {
      color: #fff;
      font-size: 40px;
    }

    fadeOut: {
      visibility: "hidden",
      opacity: 0,
      transition: "visibility 0s 2s, opacity 2s linear",
    }

    fadeIn: {
      visibility: "visible",
      opacity: 1,
      transition: "opacity 2s linear",
    }

    twilioLogo: {
      position: 'absolute';
      top: 10;
      left: 5;
      width: '40px';
    }  
    section {
      color: #fff;
    }
  `;

    return (
        <Wrapper>
            <div>
                <a href="/welcome">
                    <img width="50" id="1" className="twilioLogo" src={imgUrl}></img>
                </a>
            </div>
            <span>About</span>
            <section>
                <p>
                    Curabitur eu feugiat magna, ut malesuada est. In sit amet placerat erat, quis ornare augue. Proin mi
                    nulla, pretium vel dictum vel, ornare sed tellus. Phasellus congue placerat metus. Cras eleifend
                    justo quis hendrerit bibendum. Aliquam erat volutpat. Nulla sed neque at ante iaculis mollis a id
                    sem. Suspendisse potenti.
                </p>
                <p>
                    Praesent eu lorem euismod, convallis nisl in, cursus metus. Cras dolor eros, fringilla id erat et,
                    sollicitudin rhoncus lectus. Phasellus non vestibulum massa, vel ornare ligula. Quisque accumsan leo
                    eget nibh mattis tempor. Nunc imperdiet diam ut enim viverra, non porta lorem bibendum. Phasellus et
                    pulvinar enim. Nunc elementum quam metus, et venenatis nunc viverra eget. Sed quis lacinia enim. Ut
                    sit amet elementum lacus, nec porta elit. Sed dignissim feugiat vehicula. Nunc et commodo orci.
                </p>
            </section>
        </Wrapper>
    );
}
