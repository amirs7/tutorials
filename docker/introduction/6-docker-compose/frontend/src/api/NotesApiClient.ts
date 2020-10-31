import axios from "axios";
const API_URL = `${process.env?.VUE_APP_NOTES_API_BASE_URL}/notes`;

export interface Note {
    text: string;
    _links: {
        self: {
            href: string;
        };
    };
}

export class NotesApiClient {
    public async listNotes(): Promise<Note[]> {
        const response = await axios.get(API_URL);
        return response.data._embedded.notes;
    }

    public async createNote(text: string): Promise<Note> {
        return axios.post(API_URL, { text });
    }

    public async updateNote(id: string, text: string): Promise<Note> {
        return axios.put(`${API_URL}/${id}`, { text });
    }

    public async deleteNote(note: Note): Promise<void> {
        return axios.delete(note._links.self.href);
    }
}
