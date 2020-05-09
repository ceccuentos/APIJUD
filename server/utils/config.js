const CIVIL_SELECTOR = {
    // Cabecera --> Head
    numero: '#RUC > input:nth-child(3)',
    ano: '#RUC > input:nth-child(4)',
    boton: 'body > form > table:nth-child(9) > tbody > tr > td:nth-child(2) > a:nth-child(1) > img',
    tribunal: 'body > form > table:nth-child(9) > tbody > tr > td:nth-child(1) > select',
    linkRol: '#contentCellsAddTabla > tbody > tr > td:nth-child(1) > a',

    // Tabla
    tTabla: '#Historia > table:nth-child(2) > tbody',

    // Cabecera Tabla Body
    titulo: 'body > form > table:nth-child(20) > tbody > tr:nth-child(1) > td:nth-child(2)',
    fIngreso: 'body > form > table:nth-child(20) > tbody > tr:nth-child(1) > td:nth-child(3)',
    estadoAdm: 'body > form > table:nth-child(20) > tbody > tr:nth-child(2) > td:nth-child(1) > font > b',
    proc: 'body > form > table:nth-child(20) > tbody > tr:nth-child(2) > td:nth-child(2)',
    ubicacion: 'body > form > table:nth-child(20) > tbody > tr:nth-child(2) > td:nth-child(3)',
    etapa: 'body > form > table:nth-child(20) > tbody > tr:nth-child(3) > td:nth-child(1)',
    estadoProceso: 'body > form > table:nth-child(20) > tbody > tr:nth-child(3) > td:nth-child(2)',

    // Body-Table tr-td
    trTable: '#Historia > table:nth-child(2) > tbody > tr',
    tdImg: 'td:nth-child(2):nth-child(2)'

}

module.exports = CIVIL_SELECTOR;