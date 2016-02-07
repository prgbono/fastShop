//document.addEventListener('deviceready', main);
$(document).ready(main);

//VBLES GLOBALES
var bd; //representa a la BBDD local
var lista_compra;
var lista_articulos;
var btn_insertarArticulo, btn_cancel, btn_anadir, btn_enviarMail, btn_ok;
var new_articulo;
var mailing;
var articulo;
var counter_lista;
var counter_preparar;
var contador;
var artics;
var checkboxes;

//Sentencias SQL precompiladas
var sqlCreateTableArticulos = "CREATE TABLE IF NOT EXISTS articulos (id INTEGER PRIMARY KEY AUTOINCREMENT, articulo VARCHAR(100))";
var sqlInsertarArticulos = "INSERT INTO articulos (articulo) VALUES (?)";
var sqlSelectArticulos = "SELECT articulo FROM articulos ORDER BY articulo";
var sqlDeleteArticulos = "DELETE FROM articulos WHERE id=?";
var sqlCreateTableComprar = "CREATE TABLE IF NOT EXISTS comprar (id INTEGER PRIMARY KEY AUTOINCREMENT, articulo VARCHAR(100))";
var sqlInsertarComprar = "INSERT INTO comprar (articulo) VALUES (?)";
var sqlSelectComprar = "SELECT articulo FROM comprar ORDER BY articulo";
var sqlDeleteComprar = "DELETE FROM comprar WHERE articulo=?";
//var sqlContador = "SELECT COUNT(*) FROM comprar";


function main(){
    activarBaseDatos();
    
    //INSTANCIAS
    btn_insertarArticulo = document.getElementById("btn_insertarArticulo");
    lista_compra = document.getElementById("lista_compra");
    lista_articulos = document.getElementById("lista_articulos");
    new_articulo = document.getElementById("new_articulo");
    mailing = document.getElementById("mailing");
    btn_cancel = document.getElementById("btn_cancel");
    btn_cancelMail = document.getElementById("btn_cancelMail");
    btn_anadir = document.getElementById("btn_anadir");
    btn_enviarMail = document.getElementById("btn_enviarMail");
    btn_enviar = document.getElementById("btn_enviar");
    counter_lista = document.getElementById("counter_lista");
    counter_preparar = document.getElementById("counter_preparar");
    btn_ok = document.getElementById("btn_ok");
    artics = document.getElementsByName("artics");
    checkboxes = document.getElementsByName("checkboxes");
    
    
    //EVENTOS
    btn_insertarArticulo.onclick = mostrar;
    btn_cancel.onclick = hide;
    btn_cancelMail.onclick = hide;
    btn_enviar.onclick = mostrar;
    btn_anadir.addEventListener("click", insertarArticulo);
    btn_enviarMail.addEventListener("click", enviarMail);
    btn_ok.onclick = eliminarComprar;
    
    actualizarContador();
}

function activarBaseDatos(){
    //Crear y abrir la BBDD
    bd = openDatabase ("bdCommonShop","1.0","Base de Datos", 20000);
    
    //CREAMOS LA TRANSACTION PARA CREAR LAS TABLAS
    //Tabla de artículos guardada
    bd.transaction(function(tx){
        //console.log("bd.transaction");
        tx.executeSql(sqlCreateTableArticulos, [], listarArticulos, onError);
        //parámetros: sentenciaSQL, atributos para sentencias precompiladas, función de ÉXITO, función de ERROR
    });
    
    //Tabla de articulos a comprar
    bd.transaction(function(tx){
        tx.executeSql(sqlCreateTableComprar, [], listarArticulosComprar, onError);
        //parámetros: sentenciaSQL, atributos para sentencias precompiladas, función de ÉXITO, función de ERROR
    });
}
function hide(){
    console.log("EN HIDe");
    document.getElementById("txt_articulo").value = "";
    document.getElementById("txt_mail").value = "";
    new_articulo.style.right= "-100%";
    mailing.style.right="-100%";
    
}
function listarArticulos(){
    //console.log ("en listarArtículos");
    //Limpiar la lista
    lista_articulos.innerHTML="";
    //console.log ("en listarArtículos2");
    //Ejecutamos el select
    bd.transaction(function(tx){
        //El tercer parámetro del select te devuelve una tabla con los resultados. Es una función anónima con dos parámetros
        tx.executeSql(sqlSelectArticulos, [], function(tx, result){
            //console.log(result.rows.length);
            //Recorrer el resultset de resultados
            for (i=0;i<result.rows.length; i++){
                //Obtener los datos de una fila
                articulo = result.rows.item(i);
                //pintamos la fila en un li. Ojo al pasarle el nombre del artículo, como le pasamos un texto debe ir entrecomillado (\'). Usar el caracter de escape!
                //console.log("En listarArtículos, articulo: " +articulo["articulo"]);
                lista_articulos.innerHTML+='<li onclick="showDetail(\''+articulo["articulo"]+'\')" data-icon="false" class="listItem"><a href="#" class="ui-btn">'+articulo["articulo"]+'</a></li>';
            }
        }, onError);  //Este cuarto parámetro onError no es obligatorio
      });
}
//function listarArticulosComprar(){}
function listarArticulosComprar(){
    var articulo;
    //Limpiar la lista
    lista_compra.innerHTML="";
    //Ejecutamos el select
    bd.transaction(function(tx){
        //El tercer parámetro del select te devuelve una tabla con los resultados. Es una función anónima con dos parámetros
        tx.executeSql(sqlSelectComprar, [], function(tx, result){
            //console.log(result.rows.length); 
            //Recorrer el resultset de resultados
            for (i=0;i<result.rows.length; i++){
                //Obtener los datos de una fila
                articulo = result.rows.item(i);
                //pintamos la fila en un li
                lista_compra.innerHTML+='<li data-icon="false" class="listItem"><a href="#" name="artics" class="ui-btn">'+articulo["articulo"]+'</a><div class="right-radio"><label><input name="checkboxes" type="checkbox" name="submt_Identity" id="submt_Identity" class="custom" />&nbsp;</label></div></li>'
            }
        }, onError);  //Este cuarto parámetro onError no es obligatorio
      });
}
function onError(){
    console.log ("Ha ocurrido un problema");
}
function mostrar(){
    new_articulo.style.right= "70px";
    mailing.style.right= "70px";
}
function insertarArticulo(){
    console.log ("en insetarArticulo");
    //obtener los valores de los inputs
        var txt_articulo = document.getElementById("txt_articulo").value;
        
        //2-Comprobar que se ha introducido artículo
        if (txt_articulo.length === 0){
            document.getElementById("txt_articulo").placeholder="Introduzca artículo";
        }
        else{
            //Insertamos artículo. CREAR LA TRANSACTION
            bd.transaction(function(tx){
                tx.executeSql(sqlInsertarArticulos, [txt_articulo], function(){
                    document.getElementById("txt_articulo").value = "";
                    hide();
                    listarArticulos();
                }, onError);
            });
        }
}
function insertarComprar(txt_articulo){
    //console.log ("en insetarComprar"); 
    //Insertamos artículo en la tabla compras
    bd.transaction(function(tx){
        tx.executeSql(sqlInsertarComprar, [txt_articulo], function(){
            listarArticulosComprar();
        }, onError);
    });
        
}
function enviarMail(){
    console.log ("en enviarMail");
    //obtener los valores de los inputs
        var txt_mail = document.getElementById("txt_mail").value;
        
        //2-Comprobar que se ha introducido artículo
        if (txt_mail.length === 0){
            document.getElementById("txt_mail").placeholder="Introduzca correo";
        }
        else{
            //Hacemos el envío
            //REseteamos casilla mail y Ocultamos el div
            document.getElementById("txt_mail").value = "";
            hide();
        }
}
function actualizarContador(){
    //Esta función actualizará los valores de los contadores que están en el navbar, tanto en la pág 'lista' como en la pág 'preparar'. contadores: counter_lista y counter_preparar
    //Ejecutamos el select
    bd.transaction(function(tx){
        tx.executeSql(sqlSelectComprar, [], function(tx, result){   
            //console.log("En actualizarContador, contador: "+result.rows.length);
            //Actualizamos los contadores
            counter_lista.innerHTML=result.rows.length;
            counter_preparar.innerHTML=result.rows.length;
            //console.log("En actualizarContador, contador2: "+result.rows.length);
        }, onError);  //Este cuarto parámetro onError no es obligatorio
    });
}
function showDetail (txt_articulo){
    //Ha pulsado un artículo. Hay que pasar el artículo a la lista de artículos a comprar y aumentar el contador de productos a comprar situado en el nav (implementarlo)
    insertarComprar (txt_articulo);
    actualizarContador();
}
function eliminarComprar (){ 
    var x;
    //Mensaje de confirmación de borrado
        if(confirm("¿Eliminar compras finalizadas?")){ 
            for (x = 0; x < checkboxes.length; x++) {
            console.log("En el for: " + checkboxes[x]);
                if (checkboxes[x].checked) {
                    console.log("En el for2: " + artics[x].innerHTML);
                    eliminarArticuloComprado(artics[x].innerHTML);
                }
            }
            actualizarContador();
            listarArticulosComprar();
        }
        
}

function eliminarArticuloComprado (articulo){
    bd.transaction(function (tx) {
        console.log("En eliminarArticuloComprado " + articulo);
        tx.executeSql(sqlDeleteComprar, [articulo], function (tx, result) {}, onError);
        });
}
 
