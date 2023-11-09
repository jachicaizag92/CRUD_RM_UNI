import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { EditIcon } from "./icons/editIcon";
import { DeleteIcon } from "./icons/deleteIcon";
import { programs, columns } from "./data";
import { Estudiante } from "./interfaces/Estudiantes.interface";
import toast, { Toaster } from 'react-hot-toast';


export default function App() {
  const [data, setData] = useState<Estudiante[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(null);
  const [editedStudent, setEditedStudent] = useState<Partial<Estudiante>>({});
  const [size, setSize] = React.useState('2xl')
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    surnames: '',
    programId: ''
  });

  useEffect(() => {
    initData()
  }, []);

  const handleInputChangeform = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleSubmit = (e: any) => {
    e.preventDefault();
    fetch('http://localhost:3001/api/createStudent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then(response => {
        response.json(); initData(); toast.success('Estudiante Agregado exitosamente!');
        // Reiniciar el formulario
        setFormData({
          firstName: '',
          secondName: '',
          surnames: '',
          programId: ''
        });
      })
      .catch(error => {
        console.error(error);
      });
    initData() //volver a cargar los datos actualizados
  };

  /**
   * Metodo para recuperar data inicial
   */
  const initData = () => {
    const endpointURL = "http://localhost:3001/api/infoGralStudents";
    fetch(endpointURL)
      .then((response) => response.json())
      .then((dataFromServer) => {
        setData(dataFromServer);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  }


  /**
   * Metodo para Editar
   * @param student 
   */
  const handleEdit = (student: Estudiante) => {
    console.log(student)
    setSize(size)
    setSelectedStudent(student);
    setEditedStudent({
      id: student.id,
      firstName: student.firstName,
      secondName: student.secondName,
      surnames: student.surnames,
      programa: student.programa,
      facultad: student.facultad,
      programId: student.programId
    });
    onOpen();
  };


  /**
   * Metodo para borrar un estudiante
   * @param studentId 
   */
  const handleDelete = (studentId: any) => {
    const endpointDelete = `http://localhost:3001/api/deleteStudent/${studentId}`;
    fetch(endpointDelete, {
      method: "DELETE",
    })
      .then((response) => { response.json(); initData(); toast.success('Estudiante eliminado correctamente!') })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };


  /**
   *  Metodo para recibir cambios en editar
   * @param event 
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditedStudent((prev) => ({ ...prev, [name]: value }));
  };


  /**
   * Metodo para guardar cambios en el editar
   */
  const saveChanges = () => {
    const { facultad, programa, id, ...rest } = editedStudent

    // Comprueba que selectedStudent no sea null para obtener el ID del estudiante
    if (rest) {
      const endpointUpdate = `http://localhost:3001/api/updateStudent/${id}`;
      const requestData = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rest),
      };

      // Realiza la solicitud PUT
      fetch(endpointUpdate, requestData)
        .then((response) => {
          response.json(); onOpenChange();
          toast.success('Se actualizo el estudiante correctamente')
          initData();
        })
        .catch((error) => {
          console.error("Error al actualizar los datos:", error);
          toast.error('Se actualizo el estudiante correctamente')
        });
    } else {
      console.error("No se ha seleccionado un estudiante válido para actualizar.");
    }
  };


  /**
   * Metodo para renderizar la tabla con informacion
   */
  const renderCell = React.useCallback((data: Estudiante, columnKey: React.Key) => {
    const cellValue = data[columnKey as keyof Estudiante];
    switch (columnKey) {
      case "first_name":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize text-default-400">
              {data.firstName}
            </p>
          </div>
        );
      case "second_name":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize text-default-400">
              {data.secondName}
            </p>
          </div>
        );
      case "surnames":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize text-default-400">
              {data.surnames}
            </p>
          </div>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
            <p className="text-bold text-sm capitalize text-default-400">
              {data.programa}
            </p>
          </div>
        );
      case "status":
        return (
          <p className="text-bold text-sm capitalize text-default-400">
            {data.facultad}
          </p>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">

            <Tooltip content="Editar usuario">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Button onClick={() => handleEdit(data)} ><EditIcon /></Button>
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Eliminar usuario">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <button>
                  <DeleteIcon onClick={() => handleDelete(data.id)} />
                </button>
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);


  //renderizar el HTML del componente

  return (
    <>
      {/* ventana tipo mensaje */}
      <Toaster position="bottom-left"
        reverseOrder={false} />

      <div className=" bg-blue-100 h-screen">
        <div className="bg-sky-800 h-18 flex flex-col items-center justify-center rounded-b-sm pt-4">
          <div className="p-1">
            <h1 className="text-center text-white"><strong>CRUD</strong>  | ACTIVIDAD FINAL LÍNEA DE ÉNFASIS I</h1>
          </div>
          <div className="p-1">
            <h6 className="text-white">Presentado por: <strong>John Alexander Chicaiza Gavilanes</strong></h6>
          </div>
          <div className="p-1 pb-2">
            <h6 className="text-white">Presentado a:  Mg.<strong>Gabriel Antonio Guerrero Arellano </strong></h6>
          </div>
        </div>


        <div className="flex items-center justify-center mt-20 bg-blue-100 mr-10">

          <div className="w-1/1 ">
            {/* formulario creacion estudiante */}
            <h2 className="text-center mt-10">Ingresa un estudiante</h2>
            <form onSubmit={handleSubmit}>
              <div className="flex justify-center items-center h-500 p-3">
                <div className="space-y-3 w-96">
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChangeform}
                    label="Primer Nombre"
                  />
                  <Input
                    type="text"
                    name="secondName"
                    value={formData.secondName}
                    onChange={handleInputChangeform}
                    label="Segundo Nombre"
                  />
                  <Input
                    type="text"
                    name="surnames"
                    value={formData.surnames}
                    onChange={handleInputChangeform}
                    label="Apellidos"
                  />
                  <Select
                    label="Selecciona un programa"
                    name="programId"
                    value={formData.programId}
                    onChange={handleInputChangeform}
                  >
                    {programs.map((program) => (
                      <SelectItem key={program.value} value={program.value}>
                        {program.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <div className="flex justify-center mt-15">
                    <Button type="submit" color="primary" variant="bordered" size="lg">
                      Crear Estudiante
                    </Button>

                  </div>
                </div>
              </div>

            </form>
            {/* FIN formulario creacion estudiante */}

          </div>
          <div className="mx-2">

            {/* inicio tabla */}
            <Table aria-label="Example table with custom cells">
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn
                    key={column.uid}
                    align={column.uid === "actions" ? "center" : "start"}
                  >
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={data}>
                {(item) => (
                  <TableRow key={item.id}>
                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* final tabla */}
          </div>
        </div>




        {/* inicio Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1"><h2 className="text-center">Editar Estudiante</h2></ModalHeader>
                <ModalBody>
                  {selectedStudent && (
                    <>
                      <div className="mb-2">
                        <label>Primer Nombre:</label>
                        <Input
                          type="text"
                          name="firstName"
                          value={editedStudent.firstName || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-2">
                        <label>Segundo Nombre:</label>
                        <Input
                          type="text"
                          name="secondName"
                          value={editedStudent.secondName || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-2">
                        <label> Apellido:</label>
                        <Input
                          type="text"
                          name="surnames"
                          value={editedStudent.surnames || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={saveChanges}>
                    Guardar Cambios
                  </Button>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cerrar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
        {/* fin modal */}
      </div>
    </>
  );
}
