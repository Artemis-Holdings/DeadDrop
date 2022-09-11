import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';


// test initial render
describe('On initial render', () => {
  test('display a welcome test', () => {
    render(<App />);
    const linkElement = screen.getByText(/Welcome to dead-drop, an anonymous file and message sharing application./i);
    expect(linkElement).toBeInTheDocument();
  });
});

describe('A user', () => {
  test('sould be able to see an input.', () => {
    render(<App />);
    const inputEl = screen.getByTestId("input-dd");
    expect(inputEl).toBeInTheDocument();
  });

  test('sould be type anything into the input...', () => {
    render(<App />);
    const inputEl = screen.getByTestId("input-dd");
    userEvent.type(inputEl, "asdf");

    expect(inputEl).toHaveValue("asdf");
  });
  test('can type m to enter the message options', () => {
    render(<App />);
    const inputEl = screen.getByTestId("input-dd");
    userEvent.type(inputEl, "m");

    expect(inputEl).toHaveValue("m");
   
    const history = screen.getByTestId("history-dd");
    expect(history).toBeInTheDocument();
  });

  xtest('can type n to reach the new message', () => {
    render(<App />);
    const inputEl = screen.getByTestId("input-dd");
    userEvent.type(inputEl, "m");
    fireEvent.keyDown(inputEl, {key: 'Enter', code: "Enter", charCode: 13})
    userEvent.type(inputEl, "n");

    expect(inputEl).toHaveValue("n");
   
    const history = screen.getByTestId("history-dd");
    expect(history).toBeInTheDocument();
  });

  xtest('can type v to reach the new message ', () => {
    render(<App />);
    const inputEl = screen.getByTestId("input-dd");
    userEvent.type(inputEl, "m");

    userEvent.type(inputEl, "v");

    expect(inputEl).toHaveValue("v");
   
    const history = screen.getByTestId("history-dd");
    expect(history).toBeInTheDocument();
  });


});
