import { useState, createRef } from "react";
import firebase from "../config/firebase";
import ReCAPTCHA from "react-google-recaptcha";
import useAlerta from "../hooks/useAlerta";

const FormConsulta = () => {
  const [resultado, setResultado] = useState({ data: null, consultado: false });
  const [setAlerta, MostrarAlerta] = useAlerta(null);
  const [DatosForm, LeerForm] = useState({ cuil: "" });
  const { cuil } = DatosForm;

  const recaptchaRef = createRef();

  const onChange = (e) => {
    LeerForm({
      ...DatosForm,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setAlerta(null);

    const recaptchaValue =recaptchaRef.current.getValue();

    if (recaptchaValue) {
      if (cuil.trim().length !== 11) {
        setAlerta({
          msg: "Debe ingresar su Número de CUIL sin guiones",
          class: "danger",
        });
      } else {
        buscar(cuil);
      }
    } else {
      setAlerta({
        msg: "Debe validar reCAPTCHA",
        class: "danger",
      });
    }
  };


  const buscar = async (micuil) => {
    setResultado({ data: null, consultado: false });

    const db = firebase.database();
    const ref = db.ref("/");

    ref
      .orderByChild("CUIL")
      .equalTo(micuil)
      .once("value")
      .then((snapshot) => {
        if (snapshot.val()) {
          const data = snapshot.val();
          const key = Object.keys(snapshot.val())[0];
          setResultado({ data: data[key], consultado: true });
          console.log(data[key])
        } else {
          setAlerta({
            msg: "No se encontraron resultados.",
            class: "danger",
          });
        }
      });

  };


  const Mensaje = () => {
    let mje = "";
    if (resultado.data.APTOCARGA === "True") {
      mje = "Su solicitud de crédito número de Sticker " + resultado.data.Sticker + " se encuentra, en base a un análisis preliminar, con la documentación correcta. Continúa en proceso de evaluación. Se le notificará vía CIDI cualquier resolución."

    } else {

      if (resultado.data.EVALUADO === "True") {
        mje = "Su solicitud de crédito número de Sticker " + resultado.data.Sticker + " posee las siguientes observaciones: " + resultado.data.PARA_NOTIFICAR;
      } else {
        mje = "Su solicitud de crédito número de Sticker " + resultado.data.Sticker + " se encuentra en proceso de control y verificación de la documentación presentada.";
      }
      //console.log(mje);
    }

    return mje;
  }
  return (
    <div>
      <img src="header_banco_gente.png" width="100%" alt="bancodelagente" />
      <br></br>
      <div className="text-center p-1">
        <b>CONSULTA DE ESTADO SOLICITUD CREDITO LIBRE DISPONIBILIDAD</b>
      </div>
      <form onSubmit={onSubmit} style={{ margin: "30px" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
          <input style={{ width: "400px" }}

            type="text"
            name="cuil"
            className="form-control"
            id="cuil"
            placeholder="Ingrese su CUIL (Sin Guiones)"
            onChange={onChange}
            value={cuil}
          />
        </div>

     
        <br></br>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <ReCAPTCHA
            //https://bancodelagente-cba-gov-ar.web.app/
            sitekey="6LeH_HUbAAAAAApK164OIBLZOX0uOaZWiXYRZjw_"
            //sitekey="6LfsQhQcAAAAACwwTgk47g1TVusF8mhGb4eRC_lO"
            
            ref={recaptchaRef}
            onChange={onChange}
          />
        </div>

        
        <br></br>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button className="btn btn-primary" type="submit">
            consultar
          </button>
        </div>
      </form>
      <MostrarAlerta />

      {resultado.data ? (
        <table className="table table-striped row p-3">
          <tbody>
            <tr>
              <th scope="row">CUIT</th>
              <td>{resultado.data.CUIL}</td>
            </tr>
            <tr>
              <th scope="row">Nombre</th>
              <td>{resultado.data.Nombres}</td>
            </tr>
            <tr>
              <th scope="row">Apellido</th>
              <td>{resultado.data.Apellido}</td>
            </tr>
            <tr>
              <th scope="row">Mensaje</th>
              <td>      
                <div contentEditable='false' dangerouslySetInnerHTML={{ __html: Mensaje() }}></div>
              </td>
            </tr>
          </tbody>
        </table>
      ) : null}
    </div>
  );
};

export default FormConsulta;
