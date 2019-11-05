import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

describe('Uploader', () => {
  test('uploads file', async () => {
    const rows = ['NAME,ADDRESS,ZIP', 'james,1800 sunny ln,40000', 'ronda,1200 peaches ln,50000']
    const file = new File([rows.join('\n')], 'some.csv')
    const { getByText } = render(<Uploader/>)
    const formElement = getByText('Drop File');
    Object.defineProperty(formElement, 'files', { value: [file] });
    fireEvent.drop(formElement)
    await waitForElement(() => getByText('Success'))

    expect(getByText('Your file has been uploaded!')).toBeDefined()
  })
})
