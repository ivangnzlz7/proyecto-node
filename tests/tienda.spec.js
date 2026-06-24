import { Builder, Browser, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import chrome from 'selenium-webdriver/chrome.js'; 

describe('Tienda', function () {
    let driver;

    // Timeout global de Mocha para el test completo 
    this.timeout(10000);

    before(async function () {
        // CONFIGURACIÓN: Modo Headless
        const options = new chrome.Options();
        options.addArguments('--headless=new'); // Ejecuta en segundo plano
        options.addArguments('--disable-gpu');
        options.addArguments('--no-sandbox');

        driver = await new Builder()
            .forBrowser(Browser.CHROME)
            .setChromeOptions(options)
            .build();

        // Entrar a la app
        await driver.get('https://ivangnzlz7.github.io/TIenda-productos/');
    });

    after(async function () {
            await driver.quit();
    });

    it('1. Conexion con el Backend y renderizar los productos', async function () {
        const primerProductoSelector = By.css('#contenedor-productos .producto-card');

        try {
            await driver.wait(until.elementLocated(primerProductoSelector), 20000);
        } catch (error) {
            throw new Error('Timeout: El servidor tardó más de 20s en renderizar los productos.');
        }

        const productos = await driver.findElements(By.css('#contenedor-productos .producto-card'));
        expect(productos.length).to.be.greaterThan(0);
    });

    it('2. Flujo de compra (Agregar al carrito)', async function () {
        const localizadorBoton = By.css('#contenedor-productos .producto-card:first-child .btn-agregar');
        
        // Esperas dinámicas cortas (3-5 segundos)
        const boton = await driver.wait(until.elementLocated(localizadorBoton), 4000);
        await driver.wait(until.elementIsVisible(boton), 3000);
        await boton.click();

        // Esperar a que el texto del carrito cambie 
        const elementoCarrito = await driver.wait(
            until.elementLocated(By.css('#contenido-carrito .item-carrito .item-detalles h4')), 
            4000
        );

        let textoActual = await elementoCarrito.getText();
        expect(textoActual.trim()).to.not.equal('El carrito está vacío.');
    });

    it('3. Comprobar productos en el carrito y vaciar el mismo', async function () {
        // Este test ahora funciona porque el Test 2 ya dejó un producto en el carrito
        const cleanButton = await driver.findElement(By.css('#btn-vaciar'));
        await cleanButton.click();

        try {
            // Manejo de la alerta rápido
            await driver.wait(until.alertIsPresent(), 2000);
            let alert = await driver.switchTo().alert();
            await alert.accept();
        } catch (error) {
            throw new Error(`No apareció la alerta de confirmación: ${error.message}`);
        }

        const selectorCarrito = By.css('#contenido-carrito .cargando');
        
        // Esperamos que aparezca el texto de vacío
        let elementoCargando = await driver.wait(until.elementLocated(selectorCarrito), 3000);
        let texto = await elementoCargando.getText();
        
        expect(texto).to.equal('El carrito está vacío.');
    });
});