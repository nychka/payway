(function () {
  var spriteContainer = document.createElement('div');
  spriteContainer.innerHTML = '' +
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="svg-sprite">' +

    '<symbol id="seats-icon_yes"  viewBox="0 0 23 19">' +
    '<path style="fill: #acbcdd;  fill-rule: evenodd;" d="M142.692,227.512S143.381,230,145.154,230h9.615A1.026,1.026,0,0,0,156,228.756a2.716,2.716,0,0,0-2.461-2.489h-5.924s-0.81-1.273-1.845-3.327h8.206v-1.9h-8.838c-1.5-2.94-3.221-5.861-3.676-5.971-0.855-.207-2.489.143-2.462,1.244S142.692,227.512,142.692,227.512Z" transform="translate(-139 -211)"/>'+
    '<circle style="fill: #6ab202"  cx="17" cy="6" r="6"/>'+
    '<path style="fill: #fff; fill-rule: evenodd;"  d="M151.946,217.431l3.365,3.034,4.871-5.021-1.474-1.424-3.483,3.874-1.89-1.8Z" transform="translate(-139 -211)"/>'+
    '</symbol>' +

    '<symbol id="baggage-icon_yes"  viewBox="0 0 23 19">' +
    '<path style=" fill: #acbcdd;fill-rule: evenodd;" d="M154,55.981V44c0.858,0,1.991.264,1.991,1.122v9.841C155.993,55.82,154.86,55.981,154,55.981ZM141.982,44h1.678c0-2.5,1.39-3.527,3.107-3.527h1.553c1.714,0,3.107,1.1,3.107,3.527h1.553V55.981h-11V44Zm6.338-2.022h-1.553c-1.7,0-1.7,1.166-1.7,2.022h4.951C150.019,43.142,149.827,41.976,148.32,41.976ZM139,54.953V45.115c0-.858,1.132-1.116,1.991-1.116V55.981C140.132,55.981,139,55.811,139,54.953Z" transform="translate(-139 -37)"/>'+
    '<circle style=" fill: #6ab202;" cx="17" cy="6" r="6"/>'+
    '<path style="fill: #fff; fill-rule: evenodd;" d="M151.946,43.431l3.365,3.034,4.871-5.021-1.474-1.424-3.483,3.875-1.89-1.8Z" transform="translate(-139 -37)"/>'+
    '</symbol>' +

    '<symbol id="food-icon_yes"  viewBox="0 0 23.062 19">' +
    '<path fill="#acbcdd" d="M147.912,141.854c-5.335,0-8.063,3.614-8.063,8.161h15.985C155.834,141.939,147.912,141.854,147.912,141.854Zm-8.974,9.135v1.162L139.787,153H155.9l0.85-.849v-1.162H138.938Z" transform="translate(-138.938 -134)"></path>'+
    '<circle fill="#6ab202" cx="17.062" cy="6" r="6"></circle>'+
    '<path fill="#ffffff" d="M151.946,140.431l3.365,3.034,4.871-5.021-1.474-1.424-3.483,3.874-1.89-1.8Z" transform="translate(-138.938 -134)"></path>'+
    '</symbol>' +

    '<symbol id="svg-airports" viewBox="0 0 55.031 57.593">'+
    '<path class="cls-1" d="M61.936,286.686a20.767,20.767,0,0,0-20.931,20.6c0,13.514,19.63,35.914,19.63,35.914,1.075,1.437,1.525,1.437,2.6,0,0,0,19.631-22.4,19.631-35.914A20.769,20.769,0,0,0,61.936,286.686Zm0,29.97a9.55,9.55,0,1,1,9.7-9.549A9.625,9.625,0,0,1,61.936,316.656Z" transform="translate(-41 -286.688)"></path>'+
    '<circle class="cls-2" cx="40.422" cy="15.781" r="14.609"/>'+
    '<path id="airplane" class="cls-3" d="M88.421,295.291a0.475,0.475,0,0,0-.5-0.5,3.08,3.08,0,0,0-1.982.894l-2.863,2.865-9.85-1.282-1.3,1.3,7.643,3.491L77.621,304a1.553,1.553,0,0,0-.387.652l-3.286-.69-1.038,1.04,3.689,1.613,1.612,3.691,1.039-1.04-0.69-3.287a1.54,1.54,0,0,0,.652-0.387l1.947-1.949,3.488,7.647,1.3-1.3-1.281-9.855,2.863-2.865a3.085,3.085,0,0,0,.894-1.983" transform="translate(-41 -286.688)"></path>'+
    '</symbol>'+

    '<symbol id="svg-price_statistic" viewBox="0 0 43 44.375">'+
    '<path class="cls-1" d="M139,320h3a2,2,0,0,1,2,2v21h-7V322A2,2,0,0,1,139,320Zm12,8h3a2,2,0,0,1,2,2v13h-7V330A2,2,0,0,1,151,328Zm12-6h3a2,2,0,0,1,2,2v19h-7V324A2,2,0,0,1,163,322Zm12-11.031h3a2,2,0,0,1,2,2V343h-7V312.969A2,2,0,0,1,175,310.969Z" transform="translate(-137 -298.625)"></path>'+
    '<path class="cls-2" d="M140.752,307.138s17.337,12.891,37.076-8.517l1.632,1.933s-19.477,22.232-40.072,9.022Z" transform="translate(-137 -298.625)"></path>'+
    '<ellipse cx="20.938" cy="13.36" rx="4" ry="4.016"/>'+
    '</symbol>'+

    '<symbol id="svg-tourist" viewBox="0 0 51.03 58.04">'+
    '<path class="cls-1" d="M11.51,21.74a.87.87,0,0,0,0,1.23l0,0a.91.91,0,0,0,1.27,0,.87.87,0,0,0,0-1.23l0,0A.91.91,0,0,0,11.51,21.74ZM10.21,4h.19v7.95h2.52V4h6.27v7.95h2.3V4h.19a1.89,1.89,0,0,0,1.77-1.89A2.1,2.1,0,0,0,21.67,0H10.21A2.1,2.1,0,0,0,8.44,2.1,1.89,1.89,0,0,0,10.21,4ZM4,55.66a2.39,2.39,0,1,0,4.77,0V54H4Zm19.08,0a2.39,2.39,0,1,0,4.77,0V54H23.09v1.64ZM27,13H5a4.92,4.92,0,0,0-5,4.87V38H31.93V17.83A4.92,4.92,0,0,0,27,13ZM17.2,32.7,8.78,24.44l1-4.43,4.52-.94,8.42,8.26ZM0,48.16A4.92,4.92,0,0,0,5,53H27a4.92,4.92,0,0,0,5-4.87V40H0v8.14Z" transform="translate(0 0)"/><circle id="Ellipse_8_copy_3" data-name="Ellipse 8 copy 3" class="cls-2" cx="36.42" cy="17.47" r="14.61"/><path class="cls-3" d="M36.47,7.17h0a10.3,10.3,0,0,0,0,20.61h0a10.3,10.3,0,0,0,10.28-10.3h0A10.29,10.29,0,0,0,36.47,7.17Zm8.63,9.61H42.52a13.81,13.81,0,0,0-2-7A8.7,8.7,0,0,1,45.1,16.78ZM35.64,8.93v7.85H32C32.12,12.9,33.65,9.63,35.64,8.93Zm0,9.45V26c-1.9-.71-3.46-3.87-3.67-7.65ZM37.24,26V18.38h3.68C40.71,22.18,39.2,25.34,37.24,26Zm0-9.26V8.93c2,.7,3.51,4,3.68,7.85Zm-4.89-7a13.8,13.8,0,0,0-2,7h-2.6A8.7,8.7,0,0,1,32.35,9.79Zm-4.57,8.58h2.59a13.68,13.68,0,0,0,2,6.78A8.71,8.71,0,0,1,27.77,18.38Zm12.76,6.77a13.69,13.69,0,0,0,2-6.77h2.58A8.71,8.71,0,0,1,40.54,25.15Z" transform="translate(0 0)"></path>'+
    '</symbol>'+

    '<symbol id="icon-luggage" viewBox="0 144.4 412.9 358.4">' +
    '<path d="M396.7,502.8H16.1c-11-1.9-18.3-12.4-16.3-23.3c0.2-1,0.4-1.9,0.7-2.9l9.9-161c5.3-41.4,38.6-73.5,80.1-77.3h23.6v-3.9 c0-66.2,36.8-90,82.3-90h14.6c45.4,0,82.3,25.7,82.3,90v3.8h28.9c41.5,3.9,74.8,36,80.1,77.3l9.9,161c3.6,10.5-2.1,22-12.6,25.5 C398.7,502.4,397.7,502.6,396.7,502.8z M256.1,234.4c0-22.7-5.1-50.3-45-50.3h-14.6c-45,0-45,27.5-45,50.3v3.8h104.6V234.4z"></path>' +
    '</symbol>' +

    '<symbol id="icon-shield_avia"  viewBox="0 0 26.08 32.63">' +
    '<path class="cls-1" d="M87.63,39.29V55.64a19.83,19.83,0,0,1-13,16.28,19.84,19.84,0,0,1-13-16.28V39.29H87.63Z" transform="translate(-61.54 -39.29)"></path>' +
    '<path class="cls-2" d="M82.77,52a0.42,0.42,0,0,0,0-.63,2.72,2.72,0,0,0-1.8-.68H77.39l-5.35-7H70.42l2.6,7H70.58a1.36,1.36,0,0,0-.65.17l-1.62-2.48H67l1.3,3.31L67,55h1.3l1.62-2.48a1.36,1.36,0,0,0,.65.17H73l-2.6,7H72l5.35-7H81a2.72,2.72,0,0,0,1.8-.68" transform="translate(-61.54 -39.29)"></path>' +
    '</symbol>' +

    '<symbol id="svg-benefits-portfolio"  viewBox="0 0 55 55">' +
    ' <path d="M23 18h9v-3h-9v3zm4.5-18C12.3 0 0 12.3 0 27.5S12.3 55 27.5 55 55 42.7 55 27.5 42.7 0 27.5 0zM41 37l-1 1H15l-1-1v-8h10v3h7v-3h10v8zm-16-6v-4h5v4h-5zm16-3H31v-2h-7v2H14v-9l1-1h7v-4h11v4h7l1 1v9z"></path>' +
    '</symbol>' +

    '<symbol id="svg-benefits-call" viewBox="0 0 55 55" >' +
    '   <path d="M37.1 16.2v4.4h-2.4l1.4-2.3c.4-.8.6-1.4 1-2.1zM55 27.5C55 42.7 42.7 55 27.5 55S0 42.7 0 27.5 12.3 0 27.5 0 55 12.3 55 27.5zM23.7 25h7.5v-2h-4l1-.8c1.5-1.4 2.8-2.8 2.8-4.6 0-1.9-1.3-3.4-3.7-3.4-1.2 0-2.5.4-3.5 1.1l.7 1.8c.6-.5 1.4-.8 2.3-.9.8-.1 1.6.4 1.7 1.3v.3c0 1.3-1.1 2.5-3.5 4.5l-1.4 1.3V25zm14.9 12.9l-.1-.4c-.4-1-1.2-1.9-2.3-2.2l-3.5-1c-1.1-.2-2.2.1-3 .8l-1.3 1.3c-4.7-1.3-8.3-5-9.5-9.7l1.3-1.3c.7-.8 1-2 .8-3.1l-1-3.6c-.3-1.1-1.1-1.9-2.2-2.3l-.4-.1c-1.1-.3-2.2 0-3 .7l-1.9 1.9c-.3.4-.5.9-.6 1.3-.1 6.1 2.3 12.1 6.6 16.5 4.2 4.3 10.1 6.8 16.1 6.7.5-.1 1-.3 1.4-.6l1.9-1.9c.7-.8 1-2 .7-3zm2.1-17.3h-1.3v-6.3h-3l-4 6.5v1.6h4.7V25h2.3v-2.6h1.3v-1.8z"></path>' +
    '</symbol>' +

    '<symbol id="svg-benefits-t"  viewBox="0 0 55 55">' +
    ' <path d="M27.5 0C12.3 0 0 12.3 0 27.5S12.3 55 27.5 55 55 42.7 55 27.5 42.7 0 27.5 0zm11.2 18.1c0 .9-.7 1.6-1.6 1.6h-6.4v20.4c0 .9-.7 1.6-1.6 1.6h-4.9v-22h-8.3v-5.4c0-.9.7-1.6 1.6-1.6h21.3v5.4z"></path>' +
    '</symbol>' +

    '<symbol id="svg-benefits-rating" viewBox="0 0 55 55">' +
    ' <path d="M27.5 0C12.3 0 0 12.3 0 27.5S12.3 55 27.5 55 55 42.7 55 27.5 42.7 0 27.5 0zm14.6 23.8l-7.9 6.4 3.5 10.3c.1.3 0 .6-.2.8-.1.1-.3.2-.4.2-.1 0-.3 0-.4-.1l-9.2-5.7-9.2 5.7c-.1.1-.3.1-.4.1-.1 0-.3-.1-.4-.2-.3-.2-.4-.5-.2-.8l3.5-10.3-7.9-6.4c-.2-.1-.3-.3-.3-.6 0-.4.3-.8.7-.8h10.1l3.4-10c.1-.2.2-.4.5-.5.4-.1.8.1.9.5l3.4 10h10.1c.3 0 .6.2.7.5.1.4 0 .7-.3.9z"></path>' +
    '</symbol>' +

    '<symbol id="svg-benefits-price"  viewBox="0 0 55 55">' +
    ' <path d="M37.1 18.9c-1.5 0-2.7 1.2-2.7 2.7 0 1.5 1.2 2.7 2.7 2.7 1.5 0 2.7-1.2 2.7-2.7-.1-1.5-1.3-2.7-2.7-2.7z"/><path d="M27.5 0C12.3 0 0 12.3 0 27.5S12.3 55 27.5 55 55 42.7 55 27.5 42.7 0 27.5 0zm-6.2 39.5l-8-7.9c-1-1.1-1-2.8 0-3.8L24 17.2c1.3-1.1 2.9-1.8 4.7-1.9L14.8 29c-.4.4-.4.9 0 1.3l9.8 9.6c-1.1.6-2.4.4-3.3-.4zm22.1-15.2c-.1 1.7-.8 3.3-1.9 4.6L30.7 39.5c-1.1 1-2.8 1-3.9 0l-8-7.9c-1-1.1-1-2.8 0-3.8l10.7-10.6c1.3-1.1 2.9-1.8 4.7-1.9h6.4c1.5 0 2.7 1.2 2.7 2.7v6.3z"></path>' +
    '</symbol>' +

    '<symbol id="svg-benefits-fare"  viewBox="0 0 55 55">' +
    ' <path d="M27.5 0C12.3 0 0 12.3 0 27.5S12.3 55 27.5 55 55 42.7 55 27.5 42.7 0 27.5 0zM18 37h-6V27h6v10zm8 0h-6V20h6v17zm8 0h-6V14h6v23zm8 0h-6V23h6v14z"></path>' +
    '</symbol>' +

    '<symbol id="svg-benefits_safe"  viewBox="0 0 55 55">' +
    '<style>.st0{fill-rule:evenodd;clip-rule:evenodd;}</style>'+
    '<path class="st0" d="M27.5 0C12.3 0 0 12.3 0 27.5S12.3 55 27.5 55 55 42.7 55 27.5 42.7 0 27.5 0zm0 41.5c-4.8 0-13-14.5-13-24 0-2.3 9.1-4 13-4s13 1.7 13 4c0 9.5-8.2 24-13 24zm4.1-20.1l2 2.1-7.6 7.7-4.4-4 1.7-2.4 2.5 2.6 5.8-6z"></path>' +
    '</symbol>' +


    '<symbol id="svg-benefits_card" viewBox="0 0 55 55">' +
    ' <path d="M17 32h7v2h-7z"/></path><path d="M27.5 0C12.3 0 0 12.3 0 27.5S12.3 55 27.5 55 55 42.7 55 27.5 42.7 0 27.5 0zM42 35c0 1.7-1.3 3-2.9 3H15.9c-1.6 0-2.9-1.3-2.9-3v-9h29v9zm0-11H13v-3c0-1.7 1.3-3 2.9-3h23.2c1.6 0 2.9 1.3 2.9 3v3z"></path>' +
    '</symbol>' +

    '</svg>';

  document.addEventListener('DOMContentLoaded', function(){
    document.body.appendChild(spriteContainer);
  });
})();