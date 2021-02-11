Create database database_links;
use database_links;

Create table users(
    id int(11) not null,
    username varchar(20) not null,
    password varchar(60) not null,
    fullname varchar(20) not null
);

alter table users
 ADD PRIMARY KEY (id);

 alter table users
 modify id int(11) not null auto_increment;

 Create table producto (
     id int(11) not null PRIMARY key auto_increment,
     title varchar(150) not null,
     unidades int,
     precio_costo int,
     precio_venta int,
     description text,
     user_id int(11),
     created_at timestamp not null default current_timestamp,
     constraint fk_user foreign key (user_id) references users(id)
);
 

 Create table ventas (
     id int(11) not null PRIMARY key auto_increment,
     user_id int,
     cliente varchar(150) not null,
     nit varchar(255) not null,
     total float,
     created_at timestamp not null default current_timestamp,
     constraint fk_user foreign key (user_id) references users(id)     
); 


CREATE TABLE detalle (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    venta_id INT NOT NULL,
    CONSTRAINT fk_venta FOREIGN KEY (venta_id)
        REFERENCES ventas (id),
    title VARCHAR(150) NOT NULL,
    cantidad INT,
    description TEXT,
    precio FLOAT,
    subtotal FLOAT
);