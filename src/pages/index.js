import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";

//Importing Custom CSS
import "../assets/style.css";

//Form Validation
import { Formik, Form, Field, ErrorMessage } from "formik";
import ErrorMsg from "../Utilities/ErrorMsg";
import * as Yup from "yup";

// Importing Msaterial UI components for styling Purposes
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import CircularProgress from "@material-ui/core/CircularProgress";
import ForwardIcon from '@material-ui/icons/Forward';

const BookMarksQuery = gql`
  {
    bookmark {
      id
      title
      url
      desc
      createdAt
    }
  }
`;

const AddBookMarkMutation = gql`
  mutation addBookmark(
    $url: String!
    $desc: String!
    $createdAt: String!
    $title: String!
  ) {
    addBookmark(url: $url, desc: $desc, createdAt: $createdAt, title: $title) {
      url
    }
  }
`;

const RemoveBookMarkMutation = gql`
  mutation removeBookmark($id: ID!) {
    removeBookmark(id: $id) {
      url
    }
  }
`;

const initialValues = {
  title: "",
  url: "",
  desc: "",
};

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),

  url: Yup.string()
    .matches(
      /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
      "Enter Valid URL!"
    )
    .required("Website URl is required"),
  desc: Yup.string()
    .min(20, "Description must contain more than 100 characters")
    .required("Description is Required"),
});

const Home = () => {
  const { loading, error, data } = useQuery(BookMarksQuery);
  const [addBookmark] = useMutation(AddBookMarkMutation);
  const [removeBookmark] = useMutation(RemoveBookMarkMutation);

  const onSubmit = (values, actions) => {
    console.log(values);
    addBookmark({
      variables: {
        url: values.url,
        desc: values.desc,
        title: values.title,
        createdAt: new Date().toString(),
      },
      refetchQueries: [{ query: BookMarksQuery }],
    });

    actions.resetForm({
      values: {
        title: "",
        url: "",
        desc: "",
      },
    });
  };

  const removeBookmarkSubmit = (id) => {
    console.log(id);
    removeBookmark({
      variables: {
        id: id,
      },
      refetchQueries: [{ query: BookMarksQuery }],
    });
  };

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress color="secondary" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1> ERROR... </h1>
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 style={{ textAlign: "center", padding: "10px" }}>
          {" "}
          Bookmark Application
        </h1>
        <Paper
          style={{
            fontFamily: "Roboto",
            margin: "10px auto",
            backgroundColor: "#efefef",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              margin: "0 auto",
              padding: "30px 0px ",
            }}
          >
            <Formik
              initialValues={initialValues}
              onSubmit={onSubmit}
              validationSchema={validationSchema}
            >
              <Form>
                <Field
                  as={TextField}
                  id="Title"
                  type="text"
                  label="Title"
                  variant="outlined"
                  name="title"
                  fullWidth
                  style={{ marginTop: "10px" }}
                />
                <ErrorMessage name="title" component={ErrorMsg} />

                <Field
                  as={TextField}
                  id="URL"
                  type="text"
                  name="url"
                  label="URL"
                  variant="outlined"
                  fullWidth
                  style={{ marginTop: "10px" }}
                />
                <ErrorMessage name="url" component={ErrorMsg} />

                <Field
                  as={TextField}
                  id="Description"
                  label="Description"
                  multiline
                  type="text"
                  rows={4}
                  fullWidth
                  variant="outlined"
                  name="desc"
                  style={{ marginTop: "10px" }}
                />
                <ErrorMessage name="desc" component={ErrorMsg} />

                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  type="submit"
                  style={{ marginTop: "10px" }}
                >
                  Add BookMark
                </Button>
              </Form>
            </Formik>
          </div>
        </Paper>
      </div>

      <div>
        {data?.bookmark.map((book) => {
          return (
            <Container maxWidth="sm" key={book.id}>
              <Typography
                component="div"
                style={{
                  backgroundColor: "#efefef",
                  maxWidth: "500px",
                  margin: "0 auto",
                  height: "200px",
                  marginTop: "10px",
                  borderRadius: "10px",
                  padding: "20px 15px",
                  boxSizing: "border-bo",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <h1>{book.title}</h1>
                    <small style={{ fontWeight: "bold" }}>
                      {book.createdAt}
                    </small>
                    <p style={{ padding: "10px 0px" }}>{book.desc}</p>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ForwardIcon />}
                      size="small"
                      href= {book.url}
                      target = "_blank"
                    >
                     SEE
                    </Button>
                  </div>
                  <div>
                    <IconButton
                      aria-label="delete"
                      onClick={() => removeBookmarkSubmit(book.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </div>
              </Typography>
            </Container>
          );
        })}
      </div>
    </>
  );
};

export default Home;
