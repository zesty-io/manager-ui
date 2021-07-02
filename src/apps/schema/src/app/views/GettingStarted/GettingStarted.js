import { useState } from "react";
import { connect } from "react-redux";
import { notify } from "shell/store/notifications";

import { Wizard, WizardStep } from "../../components/Wizard";

import { ModelType } from "./components/ModelType";
import { ModelName } from "./components/ModelName";
import { FieldType } from "./components/FieldType";
import { FieldName } from "./components/FieldName";
import { FieldSuccess } from "./components/FieldSuccess";
import { createModel } from "shell/store/models";
import { createField } from "shell/store/fields";

export default connect((state) => state)(function GettingStarted(props) {
  const initialField = {
    contentModelZUID: "",
    datatype: "0",
    name: "",
    label: "",
    description: "",
    locked: false,
    settings: {
      list: true,
    },
    sort: 10000,
    dirty: false,
  };

  const [step, setStep] = useState(null);
  const [modelZUID, setModelZUID] = useState(null);
  const [field, setField] = useState(initialField);
  const [model, setModel] = useState({
    type: "",
    label: "",
    name: "",
  });

  function handleAddField() {
    setStep(3);
  }

  function handleCreateField() {
    props
      .dispatch(createField(modelZUID, field))
      .then((res) => {
        if (res.status === 201) {
          setField(initialField);
          setStep(null);
        } else {
          console.log("ERR", res);
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  function handleCreateModel() {
    props
      .dispatch(
        createModel({
          parentZUID: null,
          name: model.name,
          label: model.label,
          description: "",
          listed: true,
          type: model.type,
        })
      )
      .then((res) => {
        if (res.status === 200) {
          setModelZUID(res.data.ZUID);
          setField({ ...field, contentModelZUID: res.data.ZUID });
          setStep(2);
        } else {
          setStep(1);
          props.dispatch(
            notify({
              kind: "error",
              message: res.error,
            })
          );
        }
      })
      .catch((err) => {
        console.log("CATCH", err);
      });
  }

  function handleFinish() {
    // USER.first_time = false;
  }

  return (
    <Wizard defaultStep={step}>
      <WizardStep
        locked={!model.type}
        labelButtonNext="Next Choose Model Name"
        style={{ width: "960px" }}
      >
        <ModelType
          modelType={model.type}
          setModelType={(type) => setModel({ ...model, type })}
        />
      </WizardStep>

      <WizardStep
        onNext={handleCreateModel}
        locked={!model.label || !model.name}
        labelButtonNext="Next Choose Field Type"
        style={{ width: "750px" }}
      >
        <ModelName
          label={model.label}
          name={model.name}
          setModel={(name, value) => {
            if (name === "label") {
              setModel({
                ...model,
                label: value,
                name: value.replace(/ /g, "-").toLowerCase(),
              });
            } else {
              setModel({ ...model, label: value });
            }
          }}
        />
      </WizardStep>

      <WizardStep
        locked={field.datatype === initialField.datatype}
        showBack={false}
        style={{ width: "960px" }}
        labelButtonNext="Next Choose Field Name"
      >
        <FieldType
          fieldType={field.datatype}
          setFieldType={(value) => setField({ ...field, datatype: value })}
          modelLabel={model.label}
        />
      </WizardStep>

      <WizardStep
        onNext={handleCreateField}
        locked={
          field.label === initialField.label && field.name === initialField.name
        }
        style={{ width: "720px" }}
        labelButtonNext="Create Field"
      >
        <FieldName
          fieldLabel={field.label}
          fieldName={field.name}
          setField={(name, value) => {
            if (name === "label") {
              setField({
                ...field,
                label: value,
                name: value.replace(/ /g, "-").toLowerCase(),
              });
            } else {
              setField({ ...field, label: value });
            }
          }}
        />
      </WizardStep>

      <WizardStep style={{ width: "720px" }}>
        <FieldSuccess
          modelZUID={modelZUID}
          modelLabel={model.label}
          handleAddField={handleAddField}
          goToContent={handleFinish}
        />
      </WizardStep>
    </Wizard>
  );
});
