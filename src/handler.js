const { nanoid } = require('nanoid');
const bookshelf = require('./bookshelf');

const addBookHandler = (request, h) => {
	const {
		name,
		year,
		author,
		summary,
		publisher,
		pageCount,
		readPage,
		reading,
	} = request.payload;

	const id = nanoid(16);
	const finished = pageCount === readPage ? true : false;
	const insertedAt = new Date().toISOString();
	const updatedAt = insertedAt;

	const newBook = {
		id,
		name,
		year,
		author,
		summary,
		publisher,
		pageCount,
		readPage,
		finished,
		reading,
		insertedAt,
		updatedAt,
	};

	if (name === undefined || name === '') {
		const response = h.response({
			status: 'fail',
			message: 'Gagal menambahkan buku. Mohon isi nama buku',
		});
		response.code(400);
		return response;
	}

	if (readPage > pageCount) {
		const response = h.response({
			status: 'fail',
			message:
			'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
		});
		response.code(400);
		return response;
	}

	bookshelf.push(newBook);

	const isSuccess = bookshelf.filter((book) => book.id === id).length > 0;

	if (isSuccess) {
		const response = h.response({
			status: 'success',
			message: 'Buku berhasil ditambahkan',
			data: {
				bookId: id,
			},
		});
		response.code(201);
		return response;
	}

	const response = h.response({
		status: 'error',
		message: 'Buku gagal ditambahkan',
	});
	response.code(500);
	return response;
};

const getAllBooksHandler = (request, h) => {
	let books;
	const { name, reading, finished } = request.query;

	if (name !== undefined) {
		books = bookshelf.filter((book) =>
			book.name.toLowerCase().includes(name.toLowerCase()));
	} else if (reading !== undefined) {
		books = bookshelf.filter((book) => book.reading == reading);
		console.log(books);
	} else if (finished !== undefined) {
		books = bookshelf.filter((book) => book.finished == finished);
	} else {
		books = bookshelf;
	}

	const response = h.response({
		status: 'success',
		data: {
			books: books.map((book) => {
				const mappedBookshelf = {};

				mappedBookshelf.id = book.id;
				mappedBookshelf.name = book.name;
				mappedBookshelf.publisher = book.publisher;

				return mappedBookshelf;
			}),
		},
	});
	response.code(200);
	return response;
};

const getBookByIdHandler = (request, h) => {
	const { id } = request.params;

	const book = bookshelf.filter((b) => b.id === id)[0];

	if (book !== undefined) {
		return {
			status: 'success',
			data: {
				book,
			},
		};
	}

	const response = h.response({
		status: 'fail',
		message: 'Buku tidak ditemukan',
	});
	response.code(404);
	return response;
};

const editBookByIdHandler = (request, h) => {
	const { id } = request.params;

	const {
		name,
		year,
		author,
		summary,
		publisher,
		pageCount,
		readPage,
		reading,
	} = request.payload;
	const updatedAt = new Date().toISOString();

	const index = bookshelf.findIndex((book) => book.id === id);

	if (name === undefined || name === '') {
		const response = h.response({
			status: 'fail',
			message: 'Gagal memperbarui buku. Mohon isi nama buku',
		});
		response.code(400);
		return response;
	}

	if (readPage > pageCount) {
		const response = h.response({
			status: 'fail',
			message:
			'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
		});
		response.code(400);
		return response;
	}

	if (index !== -1) {
		bookshelf[index] = {
			...bookshelf[index],
			name,
			year,
			author,
			summary,
			publisher,
			pageCount,
			readPage,
			reading,
			updatedAt,
		};

		const response = h.response({
			status: 'success',
			message: 'Buku berhasil diperbarui',
		});
		response.code(200);
		return response;
	}

	const response = h.response({
		status: 'fail',
		message: 'Gagal memperbarui buku. Id tidak ditemukan',
	});
	response.code(404);
	return response;
};

const deleteNoteByIdHandler = (request, h) => {
	const { id } = request.params;

	const index = bookshelf.findIndex((book) => book.id === id);

	if (index !== -1) {
		bookshelf.splice(index, 1);
		const response = h.response({
			status: 'success',
			message: 'Buku berhasil dihapus',
		});
		response.code(200);
		return response;
	}

	const response = h.response({
		status: 'fail',
		message: 'Buku gagal dihapus. Id tidak ditemukan',
	});
	response.code(404);
	return response;
};

module.exports = {
	addBookHandler,
	getAllBooksHandler,
	getBookByIdHandler,
	editBookByIdHandler,
	deleteNoteByIdHandler,
};
