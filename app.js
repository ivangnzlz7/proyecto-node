// Importar el módulo de Express
import express from 'express'
import routes from './routes/routes.js';
import cors from 'cors';


// Crear una instancia de la aplicación Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);

// Puerto
const PORT = 3000

app.get('/', (req, res) => {
  res.send('Bienvenido')
})

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));