import { Builder, Browser, By, until } from 'selenium-webdriver';
import { expect } from 'chai';


describe('Tienda', function () {
    let driver;

    // Aumentamos el timeout a 15
    this.timeout(15000)

    before(async function () {
        driver = await new Builder().forBrowser(Browser.CHROME).build();
        // 1. Entrar a la app
        await driver.get('https://ivangnzlz7.github.io/TIenda-productos/');
    });
    after(async function () {
        await driver.quit();
    });
    it('Flujo de compra', async function () {
        // 1. Buscamos y esperamos el botón de agregar
        const localizadorBoton = By.css('#contenedor-productos .producto-card:first-child .btn-agregar');
        const boton = await driver.wait(until.elementLocated(localizadorBoton), 14000);
        await driver.wait(until.elementIsVisible(boton), 8000);

        // 2. Hacemos clic para agregar el producto
        await boton.click();
        console.log("-> Clic realizado en el botón. Esperando actualización del carrito...");


        await driver.wait(async () => {
            try {
                // Volvemos a hacer el findElement en cada iteración
                const elementoCarrito = await driver.findElement(By.css('#contenido-carrito .item-carrito .item-detalles h4'))
                const textoActual = await elementoCarrito.getText();

                console.log(`[Texto leído en el carrito]: "${textoActual}"`);
                return textoActual.trim() !== 'El carrito está vacío.';
            } catch (error) {
                return false;
            }
        }, 5000, 'El carrito nunca cambió su texto de vacío o desapareció');


        const elementoCarritoFinal = await driver.findElement(By.css('#contenido-carrito .item-carrito .item-detalles h4'));
        let textRes = await elementoCarritoFinal.getText();


        expect(textRes.trim()).to.not.equal('El carrito está vacío.');
    })
    it('Conexion con el Backend y renderizar los productos', async function () {
        // 1. Localizador del primer producto individual
        const primerProductoSelector = By.css('#contenedor-productos .producto-card');


        try {
            // 2. Esperamos hasta 8 segundos a que aparezca al menos un producto en la pantalla
            // Esto le da tiempo al Frontend de conectarse al Backend y traer los datos
            await driver.wait(until.elementLocated(primerProductoSelector), 14000);
        } catch (error) {
            // Si salta el timeout, lanzamos un error claro explicando que el Backend falló
            throw new Error('Timeout: El servidor tardó más de 14s en responder o está caído (0 productos renderizados).');
        }

        // 3. Si la espera tuvo éxito, ahora sí buscamos de forma segura todos los productos cargados
        const contenedor = await driver.findElement(By.css('#contenedor-productos'));
        const productos = await contenedor.findElements(By.css('.producto-card'));


        // Comprobamos que el Backend respondió con datos (la lista no está vacía)
        expect(productos.length).to.be.greaterThan(0);
    });
    it('Comprobar productos en el carrito y vaciar el mismo', async function () {
        const cleanButton = await driver.findElement(By.css('#btn-vaciar'));
        await cleanButton.click();

        try {
            let alert = await driver.switchTo().alert();
            let alertText = await alert.getText();
            console.log(`Texto de la alerta: ${alertText}`);
            await alert.accept();

        } catch (error) {
            throw new Error(`Algo fallo, motivo: ${error.message}`);
        }
        const selectorCarrito = By.css('#contenido-carrito .cargando');

        // Espera hasta un máximo de 10 segundos a que aparezca
        let elementoCargando = await driver.wait(
            until.elementLocated(selectorCarrito),
            10000 
        );
        let texto = await elementoCargando.getText();
        expect(texto).to.equal('El carrito está vacío.');
    });
})