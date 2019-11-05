import React, { Component } from 'react';
import Dropzone from "react-dropzone";
import Papa from "papaparse";
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import generateOfx from "./ofx";
import './App.css';


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ofx: "",
            errors: [],
            done: false,
            account: 'Roberts konto'
        };

        this.dropdown = [
          'Roberts konto', 'Felleskonto', 'Randis konto'
        ]
    }



    handleDrop = (files) => {
        Papa.parse(files[0], {
            header: false,
            delimiter: ";",
            complete: (results) => {
                var arrOfx = generateOfx(results.data, this.state.account);
                this.setState({
                    ofx: arrOfx['header'],
                    errors: results.errors
                });

                const link = document.createElement('a');
                link.download = arrOfx['bankid'] + '_' + arrOfx['account'] + '_' + arrOfx['sDate'] + '_' + arrOfx['eDate'] + '.ofx';
                const blob = new Blob([arrOfx['header']], {type: 'text/plain'});
                link.href = window.URL.createObjectURL(blob);
                //link.click();
            },
        });
    }

    handleChange = (event) => {
        this.setState({ account: event.value });
        console.log(this.state.account)
      };

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <h1>Arendal & Omegn Sparekasse CSV to YNAB OFX converter</h1>
                </div>
                <Dropdown options={this.dropdown} onChange={this.handleChange} value={this.dropdown[0]} placeholder="Velg en konto" />

                <Dropzone onDrop={acceptedFiles => this.handleDrop(acceptedFiles)}>
                {({getRootProps, getInputProps}) => (
    <section>
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
    </section>
  )}
</Dropzone>

                <div className="errors">
                    {this.state.errors.map(error => <p key={error.row + error.code}>
                        Warning: error line {error.row} [{error.code}]: {error.message}
                    </p>)}
                </div>

                <pre className="ofx-preview">
                    {this.state.ofx || "No results yet"}
                </pre>
            </div>
        );
    }
}

export default App;